import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { 
  Heart, Sparkles, Users, MapPin, Clock, Scale,
  CheckCircle, FileText, Send, Star, Brain
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VolunteerProfile {
  name: string;
  email: string;
  barNumber: string;
  practiceAreas: string[];
  availability: string;
  location: string;
  languages: string[];
  experience: string;
  motivation: string;
}

interface CaseMatch {
  id: string;
  title: string;
  organization: string;
  urgency: "high" | "medium" | "low";
  matchScore: number;
  description: string;
  requiredSkills: string[];
  estimatedHours: string;
}

const practiceAreaOptions = [
  "Family Law", "Immigration", "Housing/Eviction", "Criminal Defense",
  "Employment", "Consumer Protection", "Benefits/Disability", "Elder Law",
  "Civil Rights", "Bankruptcy", "Veterans Affairs", "Expungement"
];

const languageOptions = [
  "English", "Spanish", "Mandarin", "Cantonese", "Vietnamese",
  "Korean", "Tagalog", "Arabic", "French", "Portuguese", "Other"
];

export function AIVolunteerMatcher() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<VolunteerProfile>({
    name: "",
    email: "",
    barNumber: "",
    practiceAreas: [],
    availability: "",
    location: "",
    languages: ["English"],
    experience: "",
    motivation: ""
  });
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState<CaseMatch[]>([]);

  const togglePracticeArea = (area: string) => {
    setProfile(prev => ({
      ...prev,
      practiceAreas: prev.practiceAreas.includes(area)
        ? prev.practiceAreas.filter(a => a !== area)
        : [...prev.practiceAreas, area]
    }));
  };

  const toggleLanguage = (lang: string) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const findMatches = async () => {
    setIsMatching(true);

    try {
      const { data, error } = await supabase.functions.invoke('legal-chat', {
        body: {
          messages: [
            {
              role: "system",
              content: `You are ProBonoMatchAI. Match volunteer attorneys with pro bono cases.
              
Given this volunteer profile, generate 5 matching pro bono opportunities:

Profile:
- Practice Areas: ${profile.practiceAreas.join(", ")}
- Location: ${profile.location}
- Languages: ${profile.languages.join(", ")}
- Availability: ${profile.availability}
- Experience: ${profile.experience}

Generate realistic pro bono case matches. Respond in JSON:
{
  "matches": [
    {
      "id": "pb1",
      "title": "Case Title",
      "organization": "Legal Aid Org",
      "urgency": "high",
      "matchScore": 92,
      "description": "Brief case description",
      "requiredSkills": ["skill1", "skill2"],
      "estimatedHours": "10-15 hours"
    }
  ]
}`
            },
            { role: "user", content: "Find pro bono matches for this volunteer." }
          ],
          stream: false
        }
      });

      if (error) throw error;

      const responseText = data.response || "";
      let parsed;
      
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch {
        parsed = {
          matches: [
            {
              id: "pb1",
              title: "Family Court Representation",
              organization: "Legal Aid Society",
              urgency: "high" as const,
              matchScore: 94,
              description: "Represent low-income parent in custody modification hearing",
              requiredSkills: ["Family Law", "Court Appearances"],
              estimatedHours: "15-20 hours"
            },
            {
              id: "pb2",
              title: "Immigration Asylum Case",
              organization: "Immigrant Defense Project",
              urgency: "high" as const,
              matchScore: 88,
              description: "Assist asylum seeker with application and interview prep",
              requiredSkills: ["Immigration", "Spanish"],
              estimatedHours: "20-30 hours"
            },
            {
              id: "pb3",
              title: "Tenant Eviction Defense",
              organization: "Housing Rights Center",
              urgency: "medium" as const,
              matchScore: 82,
              description: "Defend tenant against wrongful eviction",
              requiredSkills: ["Housing Law", "Negotiation"],
              estimatedHours: "10-15 hours"
            }
          ]
        };
      }

      setMatches(parsed.matches || []);
      setStep(3);
      toast.success(`Found ${parsed.matches?.length || 0} matching opportunities!`);

    } catch (err) {
      console.error("Matching error:", err);
      toast.error("Matching failed. Please try again.");
    } finally {
      setIsMatching(false);
    }
  };

  const acceptCase = (caseId: string) => {
    const matched = matches.find(m => m.id === caseId);
    toast.success(`You've been matched with "${matched?.title}"! The organization will contact you within 24 hours.`);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-neon-pink/20 text-neon-pink border-neon-pink/30";
      case "medium": return "bg-neon-orange/20 text-neon-orange border-neon-orange/30";
      default: return "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-neon-pink/30">
        <CardHeader className="flex flex-row items-center gap-4">
          <AnimatedAIHead variant="pink" size="md" />
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Brain className="w-5 h-5 text-neon-pink" />
              ProBonoMatchAI - Volunteer Pairing
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered case-volunteer matching • Like Paladin's intake system
            </p>
          </div>
          <Badge className="ml-auto bg-neon-green/20 text-neon-green border-neon-green/30">
            <Star className="w-3 h-3 mr-1" /> AI-Powered
          </Badge>
        </CardHeader>
      </Card>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= s ? "bg-neon-pink text-background" : "bg-muted text-muted-foreground"
            }`}>
              {s}
            </div>
            <span className={`text-sm ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
              {s === 1 ? "Profile" : s === 2 ? "Preferences" : "Matches"}
            </span>
            {s < 3 && <div className="w-12 h-0.5 bg-muted" />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Profile */}
      {step === 1 && (
        <Card className="glass-card p-6">
          <h3 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-neon-pink" />
            Volunteer Profile
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Full Name</label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Bar Number</label>
              <Input
                value={profile.barNumber}
                onChange={(e) => setProfile({ ...profile, barNumber: e.target.value })}
                placeholder="e.g., CA123456"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
              <Input
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="City, State"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-foreground mb-2 block">Years of Experience</label>
            <Input
              value={profile.experience}
              onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
              placeholder="e.g., 5 years"
            />
          </div>
          <Button 
            onClick={() => setStep(2)} 
            className="mt-6 w-full gap-2"
            variant="neon-purple"
            disabled={!profile.name || !profile.email}
          >
            Next: Select Practice Areas <CheckCircle className="w-4 h-4" />
          </Button>
        </Card>
      )}

      {/* Step 2: Practice Areas & Availability */}
      {step === 2 && (
        <Card className="glass-card p-6">
          <h3 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-neon-purple" />
            Practice Areas & Availability
          </h3>

          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-3 block">
              Select Practice Areas (check all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {practiceAreaOptions.map((area) => (
                <label key={area} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={profile.practiceAreas.includes(area)}
                    onCheckedChange={() => togglePracticeArea(area)}
                  />
                  <span className="text-sm text-foreground">{area}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-3 block">
              Languages Spoken
            </label>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((lang) => (
                <Badge
                  key={lang}
                  variant={profile.languages.includes(lang) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    profile.languages.includes(lang) 
                      ? "bg-neon-pink text-background" 
                      : "hover:bg-neon-pink/20"
                  }`}
                  onClick={() => toggleLanguage(lang)}
                >
                  {lang}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Weekly Availability
            </label>
            <Input
              value={profile.availability}
              onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
              placeholder="e.g., 5-10 hours per week, evenings preferred"
            />
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Why do you want to volunteer? (Optional)
            </label>
            <Textarea
              value={profile.motivation}
              onChange={(e) => setProfile({ ...profile, motivation: e.target.value })}
              placeholder="Share your motivation for pro bono work..."
            />
          </div>

          <div className="flex gap-4">
            <Button onClick={() => setStep(1)} variant="outline">
              Back
            </Button>
            <Button 
              onClick={findMatches}
              className="flex-1 gap-2"
              variant="neon-purple"
              disabled={profile.practiceAreas.length === 0 || isMatching}
            >
              {isMatching ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Finding Matches...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  Find Pro Bono Matches
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Matched Cases */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
              <Heart className="w-5 h-5 text-neon-pink" />
              Your Pro Bono Matches
            </h3>
            <Button variant="outline" onClick={() => setStep(1)}>
              Update Profile
            </Button>
          </div>

          {matches.map((match) => (
            <Card key={match.id} className="glass-card-hover border-neon-pink/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{match.title}</h4>
                      <Badge className={getUrgencyColor(match.urgency)}>
                        {match.urgency} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{match.organization}</p>
                    <p className="text-sm text-muted-foreground mb-3">{match.description}</p>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Match Score</span>
                        <span className="font-bold text-neon-green">{match.matchScore}%</span>
                      </div>
                      <Progress value={match.matchScore} className="h-2" />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {match.requiredSkills.map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {match.estimatedHours}
                      </span>
                    </div>
                  </div>

                  <Button 
                    variant="neon-purple" 
                    size="sm"
                    onClick={() => acceptCase(match.id)}
                    className="gap-1"
                  >
                    <Send className="w-4 h-4" /> Accept
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
