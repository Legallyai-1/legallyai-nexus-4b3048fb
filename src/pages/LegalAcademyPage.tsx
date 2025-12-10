import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  BookOpen, 
  Trophy, 
  Clock, 
  Star,
  Play,
  CheckCircle,
  Lock,
  ArrowRight,
  Brain,
  FileText,
  Scale,
  Briefcase
} from "lucide-react";

const courses = [
  {
    id: "intro-law",
    title: "Introduction to U.S. Law",
    description: "Fundamentals of the American legal system",
    duration: "4 hours",
    lessons: 12,
    progress: 0,
    icon: Scale,
    color: "cyan",
    free: true
  },
  {
    id: "contracts",
    title: "Contract Law Essentials",
    description: "Understanding contract formation and enforcement",
    duration: "6 hours",
    lessons: 18,
    progress: 0,
    icon: FileText,
    color: "purple",
    free: true
  },
  {
    id: "constitutional",
    title: "Constitutional Law",
    description: "Your rights under the Constitution",
    duration: "8 hours",
    lessons: 24,
    progress: 0,
    icon: BookOpen,
    color: "orange",
    free: false
  },
  {
    id: "criminal",
    title: "Criminal Law & Procedure",
    description: "Criminal justice system and defendant rights",
    duration: "10 hours",
    lessons: 30,
    progress: 0,
    icon: Briefcase,
    color: "pink",
    free: false
  }
];

const barPrepModules = [
  { name: "MBE Practice", questions: 200, completed: 0, color: "cyan" },
  { name: "Essay Writing", questions: 50, completed: 0, color: "purple" },
  { name: "MPT Practice", questions: 20, completed: 0, color: "orange" },
  { name: "State-Specific", questions: 100, completed: 0, color: "green" }
];

const achievements = [
  { name: "First Lesson", icon: Star, unlocked: false },
  { name: "Course Complete", icon: Trophy, unlocked: false },
  { name: "Quiz Master", icon: Brain, unlocked: false },
  { name: "Bar Ready", icon: GraduationCap, unlocked: false }
];

export default function LegalAcademyPage() {
  const [activeTab, setActiveTab] = useState("courses");
  const navigate = useNavigate();

  return (
    <Layout>
      <FuturisticBackground>
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <AnimatedAIHead variant="blue" size="lg" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">ScholarAI</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-2">
                Virtual Legal Academy - Your AI-Powered Path to Legal Excellence
              </p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-neon-cyan">
                  <BookOpen className="w-4 h-4" /> 50+ Courses
                </span>
                <span className="flex items-center gap-1 text-neon-purple">
                  <Trophy className="w-4 h-4" /> Bar Exam Prep
                </span>
                <span className="flex items-center gap-1 text-neon-orange">
                  <Brain className="w-4 h-4" /> AI Tutor
                </span>
              </div>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Courses Started", value: "0", icon: BookOpen, color: "cyan" },
                { label: "Hours Learned", value: "0", icon: Clock, color: "purple" },
                { label: "Quizzes Passed", value: "0", icon: CheckCircle, color: "green" },
                { label: "Achievements", value: "0/12", icon: Trophy, color: "orange" }
              ].map((stat, idx) => (
                <Card key={idx} className="glass-card p-4 text-center">
                  <stat.icon className={`w-6 h-6 text-neon-${stat.color} mx-auto mb-2`} />
                  <p className={`text-2xl font-display font-bold text-neon-${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </Card>
              ))}
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-8 glass-card">
                <TabsTrigger value="courses" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
                  <BookOpen className="w-4 h-4 mr-2" /> Courses
                </TabsTrigger>
                <TabsTrigger value="bar-prep" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple">
                  <GraduationCap className="w-4 h-4 mr-2" /> Bar Prep
                </TabsTrigger>
                <TabsTrigger value="ai-tutor" className="data-[state=active]:bg-neon-orange/20 data-[state=active]:text-neon-orange">
                  <Brain className="w-4 h-4 mr-2" /> AI Tutor
                </TabsTrigger>
                <TabsTrigger value="achievements" className="data-[state=active]:bg-neon-green/20 data-[state=active]:text-neon-green">
                  <Trophy className="w-4 h-4 mr-2" /> Badges
                </TabsTrigger>
              </TabsList>

              {/* Courses Tab */}
              <TabsContent value="courses">
                <div className="grid md:grid-cols-2 gap-6">
                  {courses.map((course) => (
                    <Card key={course.id} className="glass-card overflow-hidden group hover:border-neon-cyan/50 transition-all">
                      <div className={`h-2 bg-gradient-to-r from-neon-${course.color} to-neon-${course.color}/50`} />
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-xl bg-neon-${course.color}/20`}>
                            <course.icon className={`w-6 h-6 text-neon-${course.color}`} />
                          </div>
                          {course.free ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-neon-green/20 text-neon-green">Free</span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-neon-orange/20 text-neon-orange flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Pro
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-display font-semibold text-foreground mb-2">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {course.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> {course.lessons} lessons
                          </span>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className={`text-neon-${course.color}`}>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                        <Button variant="neon" className="w-full group-hover:shadow-glow-sm">
                          <Play className="w-4 h-4 mr-2" /> Start Course
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Bar Prep Tab */}
              <TabsContent value="bar-prep">
                <div className="space-y-6">
                  <Card className="glass-card p-6 border-neon-purple/30">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-neon-purple/20">
                        <GraduationCap className="w-8 h-8 text-neon-purple" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-display font-bold text-foreground">Bar Exam Preparation</h2>
                        <p className="text-muted-foreground">AI-powered study system for all 50 states</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {barPrepModules.map((module, idx) => (
                        <div key={idx} className={`p-4 rounded-xl bg-neon-${module.color}/10 border border-neon-${module.color}/30`}>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-foreground">{module.name}</h4>
                            <span className={`text-sm text-neon-${module.color}`}>
                              {module.completed}/{module.questions}
                            </span>
                          </div>
                          <Progress value={(module.completed / module.questions) * 100} className="h-2" />
                        </div>
                      ))}
                    </div>

                    <Button variant="neon-purple" size="lg" className="w-full mt-6">
                      Start Practice Session <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Card>

                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="glass-card p-4 text-center">
                      <p className="text-3xl font-display font-bold text-neon-cyan mb-1">92%</p>
                      <p className="text-xs text-muted-foreground">Average pass rate</p>
                    </Card>
                    <Card className="glass-card p-4 text-center">
                      <p className="text-3xl font-display font-bold text-neon-purple mb-1">10,000+</p>
                      <p className="text-xs text-muted-foreground">Practice questions</p>
                    </Card>
                    <Card className="glass-card p-4 text-center">
                      <p className="text-3xl font-display font-bold text-neon-green mb-1">50</p>
                      <p className="text-xs text-muted-foreground">State exams covered</p>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* AI Tutor Tab */}
              <TabsContent value="ai-tutor">
                <Card className="glass-card p-8 text-center border-neon-orange/30">
                  <AnimatedAIHead variant="orange" size="lg" className="mx-auto mb-6" />
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                    ScholarAI - Your Personal Legal Tutor
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                    Get personalized explanations, practice questions, and study guidance from our AI tutor. 
                    Available 24/7 to help you master legal concepts.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-background/30">
                      <Brain className="w-8 h-8 text-neon-cyan mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">Adaptive Learning</p>
                      <p className="text-xs text-muted-foreground">Personalized to your level</p>
                    </div>
                    <div className="p-4 rounded-xl bg-background/30">
                      <BookOpen className="w-8 h-8 text-neon-purple mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">Instant Explanations</p>
                      <p className="text-xs text-muted-foreground">Clear, simple answers</p>
                    </div>
                    <div className="p-4 rounded-xl bg-background/30">
                      <Trophy className="w-8 h-8 text-neon-orange mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">Progress Tracking</p>
                      <p className="text-xs text-muted-foreground">See your growth</p>
                    </div>
                  </div>
                  <Button variant="neon" size="lg" onClick={() => navigate("/chat?type=academy")}>
                    <Brain className="w-5 h-5 mr-2" /> Start Learning Session
                  </Button>
                </Card>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {achievements.map((achievement, idx) => (
                    <Card 
                      key={idx} 
                      className={`glass-card p-6 text-center ${
                        achievement.unlocked ? "border-neon-green/50" : "opacity-50"
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                        achievement.unlocked ? "bg-neon-green/20" : "bg-muted/20"
                      }`}>
                        <achievement.icon className={`w-8 h-8 ${
                          achievement.unlocked ? "text-neon-green" : "text-muted-foreground"
                        }`} />
                      </div>
                      <p className="font-medium text-foreground">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {achievement.unlocked ? "Unlocked!" : "Locked"}
                      </p>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* CTA */}
            <div className="mt-12 glass-card rounded-2xl p-8 text-center border-neon-purple/30">
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                Ready to Start Your Legal Education?
              </h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of students learning law with AI-powered courses and tutoring.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="neon" size="lg">
                  Start Free Trial
                </Button>
                <Button variant="neon-outline" size="lg" onClick={() => navigate("/pricing")}>
                  View Plans
                </Button>
              </div>
            </div>

            {/* Back Button */}
            <div className="text-center mt-6">
              <Button variant="ghost" onClick={() => navigate("/ai-assistants")}>
                ← Back to AI Assistants
              </Button>
            </div>
          </div>
        </div>
      </FuturisticBackground>
    </Layout>
  );
}
