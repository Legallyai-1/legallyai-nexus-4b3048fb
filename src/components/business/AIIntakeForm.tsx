import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Sparkles, Users, FileText, Brain, CheckCircle, AlertCircle,
  ArrowRight, Loader2, Mail, Phone, Calendar, MapPin, Briefcase,
  Shield, Clock, DollarSign, MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface IntakeQuestion {
  id: string;
  question: string;
  type: "text" | "select" | "textarea" | "date" | "phone" | "email";
  options?: string[];
  required: boolean;
  aiGenerated?: boolean;
}

const practiceAreas = [
  "Personal Injury",
  "Family Law",
  "Corporate Law",
  "Real Estate",
  "Criminal Defense",
  "Immigration",
  "Employment Law",
  "Estate Planning",
  "Intellectual Property",
  "Bankruptcy",
];

export function AIIntakeForm() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [practiceArea, setPracticeArea] = useState("");
  const [aiQuestions, setAIQuestions] = useState<IntakeQuestion[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [conflictCheckResult, setConflictCheckResult] = useState<null | { clear: boolean; matches: string[] }>(null);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);

  const baseQuestions: IntakeQuestion[] = [
    { id: "firstName", question: "First Name", type: "text", required: true },
    { id: "lastName", question: "Last Name", type: "text", required: true },
    { id: "email", question: "Email Address", type: "email", required: true },
    { id: "phone", question: "Phone Number", type: "phone", required: true },
    { id: "address", question: "Address", type: "text", required: false },
    { id: "preferredContact", question: "Preferred Contact Method", type: "select", options: ["Email", "Phone", "Text"], required: true },
  ];

  const generateAIQuestions = async () => {
    if (!practiceArea) {
      toast.error("Please select a practice area first");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("legal-chat", {
        body: {
          messages: [
            { role: "system", content: "You are a legal intake specialist. Generate 5 relevant intake questions for the specified practice area. Return ONLY a JSON array with objects containing 'question', 'type' (text/textarea/select/date), and 'options' (for select type). No other text." },
            { role: "user", content: `Generate intake questions for ${practiceArea} cases.` }
          ],
          stream: false
        }
      });

      if (error) throw error;

      // Parse AI response
      const responseText = data.response;
      try {
        const parsed = JSON.parse(responseText);
        const questions: IntakeQuestion[] = parsed.map((q: any, i: number) => ({
          id: `ai_${i}`,
          question: q.question,
          type: q.type || "text",
          options: q.options,
          required: true,
          aiGenerated: true
        }));
        setAIQuestions(questions);
        toast.success("AI-generated questions added!");
      } catch {
        // Fallback questions if parsing fails
        setAIQuestions([
          { id: "ai_1", question: "Please describe your legal issue in detail", type: "textarea", required: true, aiGenerated: true },
          { id: "ai_2", question: "When did this issue first occur?", type: "date", required: true, aiGenerated: true },
          { id: "ai_3", question: "Have you consulted with any other attorneys about this matter?", type: "select", options: ["Yes", "No"], required: true, aiGenerated: true },
          { id: "ai_4", question: "What is your primary goal in pursuing this matter?", type: "textarea", required: true, aiGenerated: true },
          { id: "ai_5", question: "Are there any upcoming deadlines we should be aware of?", type: "text", required: false, aiGenerated: true },
        ]);
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("Failed to generate AI questions");
    } finally {
      setIsGenerating(false);
    }
  };

  const runConflictCheck = async () => {
    setIsCheckingConflicts(true);
    
    // Simulate conflict check - in production, this would query your conflicts database
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Demo result - in production, check against actual client/matter database
    const hasConflict = Math.random() > 0.8;
    setConflictCheckResult({
      clear: !hasConflict,
      matches: hasConflict ? ["Smith v. Johnson (Case #2023-001) - Potential conflict with adverse party"] : []
    });
    
    setIsCheckingConflicts(false);
    
    if (!hasConflict) {
      toast.success("No conflicts detected!");
    } else {
      toast.warning("Potential conflict detected - review required");
    }
  };

  const handleSubmit = () => {
    toast.success("Client intake submitted successfully!");
    // Reset form
    setStep(1);
    setFormData({});
    setPracticeArea("");
    setAIQuestions([]);
    setConflictCheckResult(null);
  };

  const allQuestions = [...baseQuestions, ...aiQuestions];
  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                AI-Powered Client Intake
                <Badge className="bg-primary/20 text-primary">Smart</Badge>
              </h2>
              <p className="text-muted-foreground">
                Intelligent questionnaires that adapt to practice area, with built-in conflict checking
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Practice Area Selection
            </CardTitle>
            <CardDescription>
              Select the practice area to generate relevant intake questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {practiceAreas.map((area) => (
                <Button
                  key={area}
                  variant={practiceArea === area ? "default" : "outline"}
                  className="h-auto py-4 flex flex-col gap-2"
                  onClick={() => setPracticeArea(area)}
                >
                  <span className="text-sm">{area}</span>
                </Button>
              ))}
            </div>
            
            {practiceArea && (
              <div className="pt-4 flex gap-3">
                <Button onClick={generateAIQuestions} disabled={isGenerating} className="flex-1">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Questions
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setStep(2)}>
                  Skip <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Client Information
            </CardTitle>
            <CardDescription>
              Collect basic client details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {baseQuestions.map((q) => (
                <div key={q.id} className="space-y-2">
                  <Label>{q.question} {q.required && <span className="text-destructive">*</span>}</Label>
                  {q.type === "select" ? (
                    <Select 
                      value={formData[q.id] || ""} 
                      onValueChange={(v) => setFormData({...formData, [q.id]: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${q.question.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {q.options?.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={q.type}
                      value={formData[q.id] || ""}
                      onChange={(e) => setFormData({...formData, [q.id]: e.target.value})}
                      placeholder={`Enter ${q.question.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Case Details
              {aiQuestions.length > 0 && (
                <Badge className="bg-purple-500/20 text-purple-400">AI-Generated</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Answer questions specific to your legal matter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiQuestions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No AI questions generated. Using default questions.</p>
                <Textarea 
                  placeholder="Please describe your legal issue in detail..."
                  value={formData.caseDescription || ""}
                  onChange={(e) => setFormData({...formData, caseDescription: e.target.value})}
                  rows={6}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {aiQuestions.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {q.question} 
                      {q.required && <span className="text-destructive">*</span>}
                      {q.aiGenerated && <Sparkles className="h-3 w-3 text-purple-400" />}
                    </Label>
                    {q.type === "textarea" ? (
                      <Textarea
                        value={formData[q.id] || ""}
                        onChange={(e) => setFormData({...formData, [q.id]: e.target.value})}
                        rows={3}
                      />
                    ) : q.type === "select" ? (
                      <Select 
                        value={formData[q.id] || ""} 
                        onValueChange={(v) => setFormData({...formData, [q.id]: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {q.options?.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={q.type}
                        value={formData[q.id] || ""}
                        onChange={(e) => setFormData({...formData, [q.id]: e.target.value})}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={() => setStep(4)}>
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Conflict Check & Review
            </CardTitle>
            <CardDescription>
              Run automated conflict check and review submission
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Conflict Check */}
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Automated Conflict Check</h4>
                  <p className="text-sm text-muted-foreground">
                    Check against existing clients and matters
                  </p>
                </div>
                <Button 
                  onClick={runConflictCheck} 
                  disabled={isCheckingConflicts}
                  variant="outline"
                >
                  {isCheckingConflicts ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Run Check"
                  )}
                </Button>
              </div>
              
              {conflictCheckResult && (
                <div className={`p-4 rounded-lg ${conflictCheckResult.clear ? 'bg-green-500/10 border-green-500/20' : 'bg-yellow-500/10 border-yellow-500/20'} border`}>
                  <div className="flex items-center gap-2">
                    {conflictCheckResult.clear ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="font-semibold text-green-400">No Conflicts Found</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                        <span className="font-semibold text-yellow-400">Potential Conflicts Detected</span>
                      </>
                    )}
                  </div>
                  {!conflictCheckResult.clear && (
                    <ul className="mt-2 text-sm text-yellow-400/80">
                      {conflictCheckResult.matches.map((match, i) => (
                        <li key={i}>• {match}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="p-4 border rounded-lg space-y-3">
              <h4 className="font-semibold">Intake Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Practice Area:</span>
                <span>{practiceArea || "General"}</span>
                <span className="text-muted-foreground">Client Name:</span>
                <span>{formData.firstName} {formData.lastName}</span>
                <span className="text-muted-foreground">Email:</span>
                <span>{formData.email}</span>
                <span className="text-muted-foreground">Phone:</span>
                <span>{formData.phone}</span>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!conflictCheckResult?.clear}
                variant="gold"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Intake
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
