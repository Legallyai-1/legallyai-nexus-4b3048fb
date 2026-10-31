import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Car, ClipboardList, FileText, Scale, Send, Users } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";

const MAX_QUESTION_LENGTH = 1000;

interface GuideSection {
  title: string;
  icon: typeof Car;
  points: string[];
}

const GUIDE: GuideSection[] = [
  {
    title: "Right after an arrest",
    icon: ClipboardList,
    points: [
      "Write down everything you remember: time, place, what officers said, and any tests you took.",
      "Keep every paper you were given (citation, notice of suspension, temporary license, release papers).",
      "Avoid discussing the details of your case on social media or with anyone other than your lawyer.",
    ],
  },
  {
    title: "Watch two separate tracks",
    icon: Scale,
    points: [
      "Most states handle a DUI on two tracks: the criminal court case and a separate driver's license (DMV or similar) action.",
      "The license action often has a very short deadline to request a hearing, sometimes only days. Check your notice right away.",
      "Missing a court date or license-hearing deadline can have serious consequences, so put every date on your calendar.",
    ],
  },
  {
    title: "Questions to bring to a lawyer",
    icon: FileText,
    points: [
      "Was the traffic stop and arrest lawful, and were breath or blood tests done correctly?",
      "What penalties apply for my charge and history in my state, and are diversion or reduced-charge options possible?",
      "How will this affect my license, insurance, job, or immigration status?",
    ],
  },
  {
    title: "Getting help",
    icon: Users,
    points: [
      "If you cannot afford a lawyer, ask the court about a public defender at your first appearance.",
      "Your state or local bar association runs lawyer referral services.",
      "Court self-help centers can explain forms and procedures for your county.",
    ],
  },
];

const DUIHubPage = () => {
  const navigate = useNavigate();
  const [state, setState] = useState("");
  const [question, setQuestion] = useState("");

  const trimmed = question.trim();
  const canSubmit = trimmed.length > 0 && trimmed.length <= MAX_QUESTION_LENGTH;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    const location = state.trim();
    const prompt = location ? `DUI question (${location}): ${trimmed}` : `DUI question: ${trimmed}`;
    navigate(`/chat?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background px-4 py-6 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto space-y-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
              <Car className="h-8 w-8 text-red-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-foreground">DUI Defense Hub</h1>
              <p className="text-muted-foreground">
                Plain-language DUI information and a direct line to Ask Lee. Legal information, not legal advice.
              </p>
            </div>
            <div className="ml-auto hidden sm:block">
              <AnimatedAIHead variant="orange" size="sm" />
            </div>
          </div>

          <Card className="bg-card/50 border-orange-500/30">
            <CardHeader>
              <CardTitle>Ask Lee about your DUI</CardTitle>
              <CardDescription>
                Your question opens in Ask Lee. Laws differ by state, so include where the arrest happened.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="block text-sm font-medium" htmlFor="dui-state">
                  State (optional)
                </label>
                <input
                  id="dui-state"
                  type="text"
                  value={state}
                  maxLength={60}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. California"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <label className="block text-sm font-medium" htmlFor="dui-question">
                  Your question
                </label>
                <Textarea
                  id="dui-question"
                  value={question}
                  maxLength={MAX_QUESTION_LENGTH}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. What is the deadline to request a license hearing after a DUI arrest?"
                  rows={4}
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {trimmed.length}/{MAX_QUESTION_LENGTH}
                  </span>
                  <Button type="submit" disabled={!canSubmit}>
                    <Send className="mr-2 h-4 w-4" />
                    Ask Lee
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GUIDE.map((section) => (
              <Card key={section.title} className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <section.icon className="h-5 w-5 text-orange-400" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            This page gives general legal information. It is not legal advice and does not create an attorney-client
            relationship. For advice about your case, talk with a licensed attorney in your state.{" "}
            <Link to="/lawyers" className="underline underline-offset-4">Find a lawyer</Link>
          </p>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default DUIHubPage;
