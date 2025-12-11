import { useState } from "react";
import { 
  DollarSign, Send, Link2, Copy, Calculator, Building2, 
  Home, Car, Briefcase, CreditCard, Landmark, User, 
  Shield, CheckCircle2, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LoanType {
  id: string;
  name: string;
  icon: any;
  description: string;
  minAmount: number;
  maxAmount: number;
  requirements: string;
  color: string;
}

const LOAN_TYPES: LoanType[] = [
  {
    id: "legal-services",
    name: "Legal Services Loan",
    icon: Briefcase,
    description: "Fund attorney fees, court costs, settlements",
    minAmount: 500,
    maxAmount: 100000,
    requirements: "No credit check required",
    color: "neon-green"
  },
  {
    id: "no-credit",
    name: "No Credit Check Loan",
    icon: Shield,
    description: "Approval based on income, not credit score",
    minAmount: 500,
    maxAmount: 25000,
    requirements: "Proof of income only",
    color: "neon-cyan"
  },
  {
    id: "personal",
    name: "Personal Loan",
    icon: User,
    description: "Flexible personal financing",
    minAmount: 1000,
    maxAmount: 50000,
    requirements: "Credit check may apply",
    color: "neon-purple"
  },
  {
    id: "business",
    name: "Business Loan",
    icon: Building2,
    description: "Fund business legal matters or expansion",
    minAmount: 5000,
    maxAmount: 500000,
    requirements: "Business documentation required",
    color: "neon-orange"
  },
  {
    id: "property",
    name: "Property/Real Estate Loan",
    icon: Home,
    description: "Real estate transactions and disputes",
    minAmount: 10000,
    maxAmount: 1000000,
    requirements: "Property documentation required",
    color: "emerald-400"
  },
  {
    id: "auto",
    name: "Auto Refinance",
    icon: Car,
    description: "Vehicle refinancing and legal matters",
    minAmount: 2000,
    maxAmount: 75000,
    requirements: "Vehicle documentation required",
    color: "blue-400"
  },
  {
    id: "settlement",
    name: "Settlement Funding",
    icon: Landmark,
    description: "Pre-settlement and lawsuit funding",
    minAmount: 1000,
    maxAmount: 250000,
    requirements: "Active case documentation",
    color: "amber-400"
  },
  {
    id: "emergency",
    name: "Emergency Legal Fund",
    icon: CreditCard,
    description: "Urgent legal matters requiring immediate funding",
    minAmount: 500,
    maxAmount: 15000,
    requirements: "Fast approval, minimal documentation",
    color: "rose-400"
  }
];

interface LawyerLoanRequestProps {
  onLoanSent?: (loanData: any) => void;
  defaultAmount?: number;
  clientName?: string;
  clientEmail?: string;
  caseId?: string;
}

export function LawyerLoanRequest({ 
  onLoanSent, 
  defaultAmount,
  clientName: initialClientName,
  clientEmail: initialClientEmail,
  caseId 
}: LawyerLoanRequestProps) {
  const [selectedLoanType, setSelectedLoanType] = useState<string>("legal-services");
  const [amount, setAmount] = useState(defaultAmount?.toString() || "");
  const [clientName, setClientName] = useState(initialClientName || "");
  const [clientEmail, setClientEmail] = useState(initialClientEmail || "");
  const [description, setDescription] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const { toast } = useToast();

  const selectedType = LOAN_TYPES.find(t => t.id === selectedLoanType);

  const quickAmounts = [1000, 2500, 5000, 10000, 25000, 50000];

  const generateLoanLink = async () => {
    if (!amount || !clientName) {
      toast({
        title: "Missing information",
        description: "Please enter amount and client name",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Get AI suggestion for the loan
      const { data: aiData } = await supabase.functions.invoke('legal-chat', {
        body: {
          messages: [
            {
              role: "user",
              content: `As a loan advisor AI, provide a brief 2-sentence recommendation for a ${selectedType?.name} of $${amount} for: ${description || 'legal services'}. Include the best loan term suggestion.`
            }
          ],
          stream: false
        }
      });

      if (aiData?.content) {
        setAiSuggestion(aiData.content);
      }

      // Generate unique loan request link
      const loanRequestId = crypto.randomUUID();
      const baseUrl = window.location.origin;
      const loanParams = new URLSearchParams({
        rid: loanRequestId,
        amt: amount,
        type: selectedLoanType,
        client: clientName,
        desc: description || 'Legal services funding',
        ...(caseId && { case: caseId })
      });

      const link = `${baseUrl}/loans?${loanParams.toString()}`;
      setGeneratedLink(link);

      // Store the loan request
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // You could store this in a loan_requests table if needed
      }

      toast({
        title: "Loan link generated!",
        description: "Send this link to your client to begin the loan process"
      });

      if (onLoanSent) {
        onLoanSent({
          amount: parseFloat(amount),
          type: selectedLoanType,
          clientName,
          clientEmail,
          link
        });
      }
    } catch (error) {
      console.error('Error generating loan link:', error);
      toast({
        title: "Error",
        description: "Failed to generate loan link",
        variant: "destructive"
      });
    }

    setIsGenerating(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({
      title: "Link copied!",
      description: "Paste this link in an email or message to your client"
    });
  };

  const sendEmailToClient = () => {
    if (!clientEmail) {
      toast({
        title: "Email required",
        description: "Enter client email to send directly",
        variant: "destructive"
      });
      return;
    }

    const subject = encodeURIComponent(`Legal Financing Option - ${selectedType?.name}`);
    const body = encodeURIComponent(
      `Dear ${clientName},\n\n` +
      `I've prepared a financing option for your legal matter:\n\n` +
      `Amount: $${parseFloat(amount).toLocaleString()}\n` +
      `Type: ${selectedType?.name}\n` +
      `${description ? `Purpose: ${description}\n` : ''}` +
      `\nClick here to apply: ${generatedLink}\n\n` +
      `This loan process is AI-assisted for faster approval.\n\n` +
      `Best regards`
    );

    window.open(`mailto:${clientEmail}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="space-y-6">
      {/* Loan Type Selection */}
      <div>
        <Label className="text-lg font-semibold mb-3 block">Select Loan Type</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {LOAN_TYPES.map(type => (
            <Card
              key={type.id}
              className={`p-3 cursor-pointer transition-all hover:scale-105 ${
                selectedLoanType === type.id 
                  ? `border-${type.color}/50 bg-${type.color}/10` 
                  : 'glass-card hover:border-border'
              }`}
              onClick={() => setSelectedLoanType(type.id)}
            >
              <type.icon className={`w-6 h-6 mb-2 text-${type.color}`} />
              <p className="font-medium text-sm text-foreground">{type.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{type.requirements}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Selected Type Details */}
      {selectedType && (
        <Card className="glass-card p-4 border-neon-green/30">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-${selectedType.color}/20`}>
              <selectedType.icon className={`w-8 h-8 text-${selectedType.color}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{selectedType.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedType.description}</p>
              <div className="flex gap-4 mt-2">
                <Badge variant="outline">Min: ${selectedType.minAmount.toLocaleString()}</Badge>
                <Badge variant="outline">Max: ${selectedType.maxAmount.toLocaleString()}</Badge>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Amount Selection */}
      <div>
        <Label className="mb-2 block">Quick Amount Selection</Label>
        <div className="flex flex-wrap gap-2">
          {quickAmounts.map(amt => (
            <Button
              key={amt}
              variant={amount === amt.toString() ? "neon-green" : "outline"}
              size="sm"
              onClick={() => setAmount(amt.toString())}
            >
              ${amt.toLocaleString()}
            </Button>
          ))}
        </div>
      </div>

      {/* Amount Input */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Custom Amount ($)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="pl-9 bg-background/30"
              min={selectedType?.minAmount}
              max={selectedType?.maxAmount}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="clientName">Client Name</Label>
          <Input
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Client's full name"
            className="bg-background/30"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clientEmail">Client Email (optional)</Label>
          <Input
            id="clientEmail"
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="client@email.com"
            className="bg-background/30"
          />
        </div>
        <div>
          <Label htmlFor="description">Purpose/Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of legal matter"
            className="bg-background/30"
          />
        </div>
      </div>

      {/* Generate Button */}
      <Button
        variant="neon-green"
        size="lg"
        className="w-full"
        onClick={generateLoanLink}
        disabled={isGenerating || !amount || !clientName}
      >
        {isGenerating ? (
          <>
            <Sparkles className="w-4 h-4 mr-2 animate-pulse" /> Generating with AI...
          </>
        ) : (
          <>
            <Calculator className="w-4 h-4 mr-2" /> Generate Client Loan Link
          </>
        )}
      </Button>

      {/* AI Suggestion */}
      {aiSuggestion && (
        <Card className="glass-card p-4 border-neon-cyan/30">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-neon-cyan mt-0.5" />
            <div>
              <p className="font-medium text-neon-cyan text-sm">AI Recommendation</p>
              <p className="text-sm text-foreground mt-1">{aiSuggestion}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Generated Link */}
      {generatedLink && (
        <Card className="glass-card p-4 border-neon-green/30">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-neon-green" />
            <span className="font-medium text-neon-green">Loan Link Ready!</span>
          </div>
          
          <div className="flex gap-2 mb-4">
            <Input
              value={generatedLink}
              readOnly
              className="bg-background/30 text-sm font-mono"
            />
            <Button variant="outline" size="icon" onClick={copyLink}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="glass" className="flex-1" onClick={copyLink}>
              <Link2 className="w-4 h-4 mr-2" /> Copy Link
            </Button>
            {clientEmail && (
              <Button variant="neon" className="flex-1" onClick={sendEmailToClient}>
                <Send className="w-4 h-4 mr-2" /> Email to Client
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            Client will complete AI-assisted application at this link
          </p>
        </Card>
      )}
    </div>
  );
}
