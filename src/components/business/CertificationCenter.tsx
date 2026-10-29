import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, BookOpen, GraduationCap, CheckCircle, Clock, 
  Play, Download, Shield, Star, Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getSupabaseFunctionHeaders } from '@/lib/supabase-functions';
import { toast } from 'sonner';

interface CertificationCenterProps {
  userId?: string;
}

const CARD_COLORS = ['from-purple-500 to-indigo-500', 'from-cyan-500 to-blue-500', 'from-green-500 to-emerald-500', 'from-amber-500 to-orange-500'];

export function CertificationCenter({ userId }: CertificationCenterProps) {
  const [loading, setLoading] = useState(false);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('available');
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/certification-engine`, {
        method: 'POST',
        headers: getSupabaseFunctionHeaders(session.access_token),
        body: JSON.stringify({ action: 'list' })
      });

      const result = await response.json();
      if (!response.ok || result.error) throw new Error(result.error || 'Could not load certifications');

      setLoadError(null);
      setCertifications(result.certifications || []);
      setEnrollments(result.certifications?.filter((c: any) => c.enrollment && !c.completed) || []);
      setCompleted(result.certifications?.filter((c: any) => c.completed) || []);
    } catch (error: any) {
      setCertifications([]);
      setLoadError(error?.message || 'Could not load certifications');
    } finally {
      setLoading(false);
    }
  };

  const enroll = async (certificationId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/certification-engine`, {
        method: 'POST',
        headers: getSupabaseFunctionHeaders(session.access_token),
        body: JSON.stringify({
          action: 'enroll',
          certification_id: certificationId
        })
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      toast.success('Enrolled successfully!');
      fetchCertifications();
      setActiveTab('in-progress');
    } catch (error: any) {
      toast.error(error.message || 'Enrollment failed');
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, [userId]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technology': return 'bg-purple-500/10 text-purple-500';
      case 'Practice': return 'bg-cyan-500/10 text-cyan-500';
      case 'Business': return 'bg-green-500/10 text-green-500';
      case 'Regulatory': return 'bg-red-500/10 text-red-500';
      default: return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Certification Center
          </h2>
          <p className="text-muted-foreground">Earn micro-certifications to boost your AI predictions</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-4 py-2">
            <Award className="h-4 w-4 mr-2 text-primary" />
            {completed.length} Certifications Earned
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{certifications.length}</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Play className="h-8 w-8 text-cyan-500" />
              <div>
                <p className="text-2xl font-bold">{enrollments.length}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{completed.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  +{completed.reduce((sum, c) => sum + (c.prediction_boost || 0), 0)}%
                </p>
                <p className="text-sm text-muted-foreground">AI Boost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="available">Available ({certifications.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({enrollments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.length === 0 && (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  {loading ? 'Loading certifications…' : loadError ? `${loadError}. Try again shortly.` : 'No certifications are published yet.'}
                </CardContent>
              </Card>
            )}
            {certifications.map((cert, index) => (
              <Card key={cert.id} className="overflow-hidden hover:border-primary/50 transition-all group">
                <div className={`h-2 bg-gradient-to-r ${CARD_COLORS[index % CARD_COLORS.length]}`} />
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={getCategoryColor(cert.category)}>
                      {cert.category}
                    </Badge>
                    {cert.completed ? <Badge variant="outline" className="text-xs">Earned</Badge> : cert.enrollment ? <Badge variant="outline" className="text-xs">In progress</Badge> : null}
                  </div>
                  <h4 className="font-bold text-lg mb-1">{cert.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{cert.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {cert.required_courses?.length ?? 0} courses
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {cert.required_quizzes?.length ?? 0} quizzes
                    </span>
                  </div>

                  <Button 
                    className="w-full group-hover:bg-primary"
                    variant="outline"
                    onClick={() => enroll(cert.id)}
                  >
                    Start Certification
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          {enrollments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No certifications in progress</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start a certification to see your progress here
                </p>
                <Button onClick={() => setActiveTab('available')}>
                  Browse Certifications
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold">{enrollment.name}</h4>
                        <p className="text-sm text-muted-foreground">{enrollment.category}</p>
                      </div>
                      <Badge>{enrollment.enrollment?.progress_percentage || 0}%</Badge>
                    </div>
                    <Progress value={enrollment.enrollment?.progress_percentage || 0} className="mb-4" />
                    <Button className="w-full">Continue Learning</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completed.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No certifications completed yet</h3>
                <p className="text-sm text-muted-foreground">
                  Complete certifications to earn badges and boost AI predictions
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completed.map((cert) => (
                <Card key={cert.id} className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
                  <CardContent className="pt-4 text-center">
                    <Award className="h-16 w-16 mx-auto text-primary mb-3" />
                    <h4 className="font-bold text-lg">{cert.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Earned {new Date(cert.completed?.earned_at).toLocaleDateString()}
                    </p>
                    <div className="flex justify-center gap-2 mb-4">
                      <Badge variant="outline">Score: {cert.completed?.score}%</Badge>
                      <Badge className="bg-green-500">+{cert.prediction_boost}% AI</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Shield className="h-4 w-4 mr-1" />
                        Verify
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
