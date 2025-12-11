import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CertificationRequest {
  action: 'list' | 'enroll' | 'progress' | 'complete' | 'verify' | 'generate_certificate';
  certification_id?: string;
  user_id?: string;
  verification_code?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: CertificationRequest = await req.json();
    const { action, certification_id, verification_code } = body;
    const userId = userData.user.id;

    let result: any = null;

    switch (action) {
      case 'list':
        // Get all certifications with user's progress
        const { data: certifications } = await supabase
          .from('micro_certifications')
          .select('*')
          .eq('is_active', true);

        const { data: enrollments } = await supabase
          .from('enrollment_records')
          .select('*')
          .eq('user_id', userId);

        const { data: completed } = await supabase
          .from('user_certifications')
          .select('*')
          .eq('user_id', userId);

        result = {
          certifications: certifications?.map(cert => ({
            ...cert,
            enrollment: enrollments?.find(e => e.certification_id === cert.id),
            completed: completed?.find(c => c.certification_id === cert.id)
          })) || []
        };
        break;

      case 'enroll':
        if (!certification_id) {
          throw new Error('Certification ID required');
        }

        // Check if already enrolled
        const { data: existing } = await supabase
          .from('enrollment_records')
          .select('id')
          .eq('user_id', userId)
          .eq('certification_id', certification_id)
          .single();

        if (existing) {
          throw new Error('Already enrolled in this certification');
        }

        const { data: enrollment, error: enrollError } = await supabase
          .from('enrollment_records')
          .insert({
            user_id: userId,
            certification_id,
            progress_percentage: 0,
            status: 'enrolled',
            completed_courses: [],
            completed_quizzes: []
          })
          .select()
          .single();

        if (enrollError) throw enrollError;

        result = { success: true, enrollment };
        break;

      case 'progress':
        // Get detailed progress for a certification
        if (!certification_id) {
          throw new Error('Certification ID required');
        }

        const { data: cert } = await supabase
          .from('micro_certifications')
          .select('*')
          .eq('id', certification_id)
          .single();

        const { data: userEnrollment } = await supabase
          .from('enrollment_records')
          .select('*')
          .eq('user_id', userId)
          .eq('certification_id', certification_id)
          .single();

        const { data: quizAttempts } = await supabase
          .from('academy_quiz_attempts')
          .select('*')
          .eq('user_id', userId)
          .in('quiz_id', cert?.required_quizzes || []);

        const { data: courseProgress } = await supabase
          .from('academy_progress')
          .select('*')
          .eq('user_id', userId)
          .in('course_id', cert?.required_courses || []);

        result = {
          certification: cert,
          enrollment: userEnrollment,
          quiz_progress: quizAttempts,
          course_progress: courseProgress,
          can_complete: userEnrollment?.progress_percentage === 100
        };
        break;

      case 'complete':
        if (!certification_id) {
          throw new Error('Certification ID required');
        }

        // Verify completion requirements
        const { data: certToComplete } = await supabase
          .from('micro_certifications')
          .select('*')
          .eq('id', certification_id)
          .single();

        const { data: userProgress } = await supabase
          .from('enrollment_records')
          .select('*')
          .eq('user_id', userId)
          .eq('certification_id', certification_id)
          .single();

        if (!userProgress || userProgress.progress_percentage < 100) {
          throw new Error('Certification requirements not met');
        }

        // Generate verification code
        const verificationCode = `LAI-${certification_id.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

        // Calculate score from quiz attempts
        const { data: attempts } = await supabase
          .from('academy_quiz_attempts')
          .select('score, max_score')
          .eq('user_id', userId)
          .in('quiz_id', certToComplete?.required_quizzes || []);

        const totalScore = attempts?.reduce((sum, a) => sum + (a.score || 0), 0) || 0;
        const totalMax = attempts?.reduce((sum, a) => sum + (a.max_score || 100), 0) || 100;
        const finalScore = (totalScore / totalMax) * 100;

        const { data: userCert, error: certError } = await supabase
          .from('user_certifications')
          .insert({
            user_id: userId,
            certification_id,
            verification_code: verificationCode,
            score: finalScore,
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
          })
          .select()
          .single();

        if (certError) throw certError;

        // Update enrollment status
        await supabase
          .from('enrollment_records')
          .update({ status: 'completed' })
          .eq('id', userProgress.id);

        result = {
          success: true,
          certificate: userCert,
          prediction_boost: certToComplete?.prediction_boost || 0
        };
        break;

      case 'verify':
        if (!verification_code) {
          throw new Error('Verification code required');
        }

        const { data: verifiedCert } = await supabase
          .from('user_certifications')
          .select('*, micro_certifications(*)')
          .eq('verification_code', verification_code)
          .single();

        if (!verifiedCert) {
          result = { valid: false, message: 'Invalid verification code' };
        } else {
          const isExpired = verifiedCert.expires_at && new Date(verifiedCert.expires_at) < new Date();
          result = {
            valid: !isExpired,
            expired: isExpired,
            certification_name: verifiedCert.micro_certifications?.name,
            earned_at: verifiedCert.earned_at,
            expires_at: verifiedCert.expires_at,
            score: verifiedCert.score
          };
        }
        break;

      case 'generate_certificate':
        if (!certification_id) {
          throw new Error('Certification ID required');
        }

        const { data: certRecord } = await supabase
          .from('user_certifications')
          .select('*, micro_certifications(*)')
          .eq('user_id', userId)
          .eq('certification_id', certification_id)
          .single();

        if (!certRecord) {
          throw new Error('Certification not found');
        }

        // Return certificate data (actual PDF generation would be done client-side or via separate service)
        result = {
          certificate_data: {
            recipient_name: userData.user.email,
            certification_name: certRecord.micro_certifications?.name,
            earned_date: certRecord.earned_at,
            verification_code: certRecord.verification_code,
            score: certRecord.score,
            issuer: 'LegallyAI Academy',
            valid_until: certRecord.expires_at
          }
        };
        break;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Certification Engine error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
