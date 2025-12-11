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
import { toast } from 'sonner';

interface CertificationCenterProps {
  userId?: string;
}

const MICRO_CERTIFICATIONS = [
  {
    id: 'ai-drafting',
    name: 'AI Legal Drafting',
    category: 'Technology',
    description: 'Master AI-powered document generation and review',
    courses: 2,
    quizzes: 3,
    hours: 8,
    prediction_boost: 10,
    color: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'case-strategy',
    name: 'Case Strategy Analytics',
    category: 'Practice',
    description: 'Leverage data for winning case strategies',
    courses: 3,
    quizzes: 4,
    hours: 12,
    prediction_boost: 15,
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'client-management',
    name: 'Client Relations Excellence',
    category: 'Business',
    description: 'Build lasting client relationships and retention',
    courses: 2,
    quizzes: 2,
    hours: 6,
    prediction_boost: 5,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'billing-mastery',
    name: 'Legal Billing Mastery',
    category: 'Business',
    description: 'Maximize revenue through optimized billing practices',
    courses: 2,
    quizzes: 3,
    hours: 8,
    prediction_boost: 8,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'compliance-pro',
    name: 'Compliance Professional',
    category: 'Regulatory',
    description: 'Stay ahead of regulatory requirements',
    courses: 4,
    quizzes: 5,
    hours: 16,
    prediction_boost: 12,
    color: 'from-red-500 to-pink-500'
  },
  {
    id: 'litigation-tech',
    name: 'Litigation Technology',
    category: 'Technology',
    description: 'Advanced e-discovery and litigation support tools',
    courses: 3,
    quizzes: 4,
    hours: 14,
    prediction_boost: 15,
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'negotiation',
    name: 'Advanced Negotiation',
    category: 'Practice',
    description: 'Master settlement and deal negotiation techniques',
    courses: 2,
    quizzes: 3,
    hours: 10,
    prediction_boost: 12,
    color: 'from-teal-500 to-cyan-500'
  },
  {
    id: 'ethics',
    name: 'Legal Ethics Excellence',
    category: 'Regulatory',
    description: 'Ethical practice and professional responsibility',
    courses: 3,
    quizzes: 4,
    hours: 12,
    prediction_boost: 10,
    color: 'from-slate-500 to-gray-500'
  },
  {
    id: 'trial-prep',
    name: 'Trial Preparation Pro',
    category: 'Practice',
    description: 'Comprehensive trial preparation strategies',
    courses: 4,
    quizzes: 5,
    hours: 20,
    prediction_boost: 20,
    color: 'from-rose-500 to-red-500'
  },
  {
    id: 'contract-ai',
    name: 'AI Contract Analysis',
    category: 'Technology',
    description: 'AI-powered contract review and analysis',
    courses: 2,
    quizzes: 3,
    hours: 10,
    prediction_boost: 12,
    color: 'from-violet-500 to-purple-500'
  }
];

export function CertificationCenter({ userId }: CertificationCenterProps) {
  const [loading, setLoading] = useState(false);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('available');

  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/certification-engine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ action: 'list' })
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      setCertifications(result.certifications || []);
      setEnrollments(result.certifications?.filter((c: any) => c.enrollment && !c.completed) || []);
      setCompleted(result.certifications?.filter((c: any) => c.completed) || []);
    } catch (error: any) {
      // Use mock data if API fails
      setCertifications(MICRO_CERTIFICATIONS);
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
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
                <p className="text-2xl font-bold">{MICRO_CERTIFICATIONS.length}</p>
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
          <TabsTrigger value="available">Available ({MICRO_CERTIFICATIONS.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({enrollments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MICRO_CERTIFICATIONS.map((cert) => (
              <Card key={cert.id} className="overflow-hidden hover:border-primary/50 transition-all group">
                <div className={`h-2 bg-gradient-to-r ${cert.color}`} />
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={getCategoryColor(cert.category)}>
                      {cert.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      +{cert.prediction_boost}% AI
                    </Badge>
                  </div>
                  <h4 className="font-bold text-lg mb-1">{cert.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{cert.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {cert.courses} courses
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {cert.hours}h
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
