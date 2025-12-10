import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, Download, Printer, Copy, 
  Loader2, Sparkles, AlertCircle, Lock, Mic
} from "lucide-react";
import { VoiceInputButton } from "@/components/ui/VoiceInputButton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AdBanner from "@/components/ads/AdBanner";
import AdContainer from "@/components/ads/AdContainer";

const documentTypes = [
  "NDA (Non-Disclosure Agreement)",
  "Employment Contract",
  "Freelancer Agreement",
  "LLC Operating Agreement",
  "Lease Agreement",
  "Service Agreement",
  "Will & Testament",
  "Power of Attorney",
  "Promissory Note",
  "Partnership Agreement",
];

export default function GeneratePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication status and verify payment server-side
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsCheckingAuth(false);
      
      // If user is authenticated, verify payment status server-side
      if (session?.user) {
        verifyPaymentStatus();
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        verifyPaymentStatus();
      } else {
        setIsPaid(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Server-side payment verification
  const verifyPaymentStatus = async () => {
    setIsVerifyingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment');
      
      if (error) {
        console.error("Payment verification error:", error);
        setIsPaid(false);
        return;
      }
      
      setIsPaid(data?.hasPaid === true);
    } catch (error) {
      console.error("Error verifying payment:", error);
      setIsPaid(false);
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  // Check for prompt in URL params (from homepage)
  useEffect(() => {
    const urlPrompt = searchParams.get("prompt");
    if (urlPrompt) {
      setPrompt(urlPrompt);
      // Only auto-generate if user is authenticated
      if (user) {
        handleGenerate(urlPrompt);
      }
    }
  }, [searchParams, user]);

  const handleGenerate = async (inputPrompt?: string) => {
    const finalPrompt = inputPrompt || prompt;
    if (!finalPrompt.trim()) {
      toast.error("Please describe your legal document needs");
      return;
    }

    // Check authentication before generating
    if (!user) {
      toast.error("Please sign in to generate documents");
      navigate("/auth");
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-document', {
        body: { prompt: finalPrompt }
      });

      if (error) {
        console.error("Generation error:", error);
        // Handle authentication errors
        if (error.message?.includes("401") || error.message?.includes("Authentication")) {
          toast.error("Please sign in to generate documents");
          navigate("/auth");
          return;
        }
        toast.error("Failed to generate document. Please try again.");
        setIsGenerating(false);
        return;
      }

      if (data.error) {
        if (data.error.includes("Authentication") || data.error.includes("sign in")) {
          toast.error(data.error);
          navigate("/auth");
          return;
        }
        toast.error(data.error);
        setIsGenerating(false);
        return;
      }

      setGeneratedDoc(data.document);
      toast.success("Document generated successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUnlock = async () => {
    if (!user) {
      toast.error("Please sign in first");
      navigate("/auth");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: 'price_1SckVt0QhWGUtGKvl9YdmQqk' } // Document generation price
      });

      if (error) {
        console.error("Checkout error:", error);
        toast.error("Failed to start checkout. Please try again.");
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleDownload = () => {
    if (!generatedDoc) {
      toast.error("No document to download");
      return;
    }
    
    // Create a downloadable text file
    const blob = new Blob([generatedDoc], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'legal-document.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success("Document downloaded!");
  };

  const handlePrint = () => {
    if (!generatedDoc) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // Create document structure safely without string interpolation of user content
      printWindow.document.write(`
        <html>
          <head>
            <title>Legal Document - LegallyAI</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; }
              pre { white-space: pre-wrap; font-family: inherit; }
            </style>
          </head>
          <body>
            <pre id="doc-content"></pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Safely set content using textContent to prevent XSS
      const contentElement = printWindow.document.getElementById('doc-content');
      if (contentElement) {
        contentElement.textContent = generatedDoc;
      }
      
      printWindow.print();
    }
  };

  const handleCopy = () => {
    if (generatedDoc) {
      navigator.clipboard.writeText(generatedDoc);
      toast.success("Copied to clipboard!");
    }
  };

  if (isCheckingAuth) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-legal-gold" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-12 md:py-20 bg-background min-h-screen">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-legal-gold/10 border border-legal-gold/30 mb-6">
              <Sparkles className="h-4 w-4 text-legal-gold" />
              <span className="text-sm font-medium text-legal-gold">AI-Powered</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Generate Legal Documents
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Describe your legal needs in plain English. Our AI will generate a professional, 
              legally-accurate document in seconds.
            </p>
            {!user && (
              <div className="mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 max-w-md mx-auto">
                <p className="text-sm text-amber-600">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  Please <button onClick={() => navigate("/auth")} className="underline font-medium">sign in</button> to generate documents
                </p>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-card border border-border shadow-card">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-legal-gold" />
                  Describe Your Document
                </h2>

                <div className="relative">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: Create an NDA for a California startup hiring a Texas-based developer. Include non-compete clause and intellectual property protection..."
                    className="min-h-[200px] mb-4 resize-none text-base pr-14"
                  />
                  <VoiceInputButton
                    onTranscript={(text) => setPrompt(prev => prev ? `${prev} ${text}` : text)}
                    className="absolute bottom-6 right-2"
                  />
                </div>

                <Button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating || !prompt.trim() || !user}
                  variant="gold"
                  size="lg"
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating Document...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Generate Document
                    </>
                  )}
                </Button>
              </div>

              {/* Quick Templates */}
              <div className="p-6 rounded-2xl bg-muted border border-border">
                <h3 className="font-semibold text-foreground mb-4">Popular Templates</h3>
                <div className="flex flex-wrap gap-2">
                  {documentTypes.slice(0, 6).map((type) => (
                    <button
                      key={type}
                      onClick={() => setPrompt(`Create a comprehensive ${type} for my business. Include all standard legal provisions, definitions, and signature blocks.`)}
                      className="px-3 py-2 text-sm rounded-lg bg-background border border-border hover:border-legal-gold/50 hover:bg-legal-gold/5 transition-colors"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-card border border-border shadow-card min-h-[400px]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Generated Document
                  </h2>
                  {generatedDoc && (
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>

                {!generatedDoc ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">
                      Your generated document will appear here
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-foreground bg-muted p-4 rounded-lg font-mono leading-relaxed">
                      {generatedDoc}
                    </pre>
                  </div>
                )}
              </div>

              {generatedDoc && !isPaid && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-legal-gold/10 to-amber-500/10 border border-legal-gold/30">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-legal-gold/20">
                      <Lock className="h-6 w-6 text-legal-gold" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">
                        Unlock Full Document
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Download as PDF with professional formatting for just $5.
                      </p>
                      <Button onClick={handleUnlock} variant="gold" className="w-full sm:w-auto">
                        Pay $5 – Unlock PDF Download
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {generatedDoc && isPaid && (
                <div className="flex gap-3">
                  <Button onClick={handleDownload} variant="gold" className="flex-1">
                    <Download className="h-4 w-4" />
                    Download Document
                  </Button>
                  <Button onClick={handlePrint} variant="outline" className="flex-1">
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted border border-border">
              <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <strong>Disclaimer:</strong> LegallyAI generates documents using AI technology 
                for informational purposes only. This is not legal advice. We recommend consulting 
                with a licensed attorney before signing or relying on any legal document.
              </p>
            </div>
          </div>

          {/* Ad Banner (Replace slot with your Generate Page ad unit ID) */}
          <AdContainer position="bottom" className="max-w-3xl mx-auto mt-8">
            <AdBanner slot="GENERATE_PAGE_SLOT" format="horizontal" />
          </AdContainer>
        </div>
      </section>
    </Layout>
  );
}
