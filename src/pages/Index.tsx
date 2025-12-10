import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Copy, Download, Smartphone } from "lucide-react";
import AdBanner from "@/components/ads/AdBanner";
import AdContainer from "@/components/ads/AdContainer";
import legallyAIIcon from "@/assets/legallyai-icon.jpg";

export default function Index() {
  const [prompt, setPrompt] = useState("");
  const [document, setDocument] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    // Navigate to generate page with prompt
    navigate(`/generate?prompt=${encodeURIComponent(prompt)}`);
  };

  const copyToClipboard = () => {
    if (document) {
      navigator.clipboard.writeText(document);
    }
  };

  return (
    <div className="min-h-screen bg-legal-navy relative overflow-hidden">
      {/* Animated Particles Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Generate multiple particles */}
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              backgroundColor: i % 3 === 0 
                ? 'hsl(45 93% 58% / 0.6)' 
                : i % 3 === 1 
                  ? 'hsl(187 100% 42% / 0.5)' 
                  : 'hsl(0 0% 100% / 0.3)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${Math.random() * 4 + 4}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* App Icon */}
        <div className="mb-8 animate-fade-up">
          <img 
            src={legallyAIIcon} 
            alt="LegallyAI App Icon" 
            className="w-28 h-28 rounded-2xl shadow-2xl border-2 border-legal-gold/30"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <span className="text-foreground dark:text-white">Legally</span>
          <span className="text-legal-gold">AI</span>
        </h1>

        {/* Tagline */}
        <p className="text-lg md:text-xl text-muted-foreground text-center mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          Your AI Lawyer - Perfect Documents in 20 Seconds
        </p>

        {/* Document Output (shown after generation) */}
        {document && (
          <div className="w-full max-w-2xl mb-8 animate-fade-up">
            <div className="bg-card/10 backdrop-blur-sm border border-border/30 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-legal-gold mb-4">Legal Document Generated</h2>
              <div className="bg-background/5 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
                <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-body">{document}</pre>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyToClipboard}
                  className="border-border/30 text-foreground/80 hover:bg-foreground/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button 
                  variant="gold" 
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF - $5
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="w-full max-w-2xl animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Create NDA for California startup hiring Texas developer..."
            className="w-full min-h-[120px] bg-card/10 backdrop-blur-sm border-2 border-legal-cyan/30 rounded-xl text-foreground placeholder:text-muted-foreground/50 resize-none focus:border-legal-cyan/60 focus:ring-0 text-base p-4"
          />
        </div>

        {/* Generate Button */}
        <div className="mt-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <Button 
            variant="gold" 
            size="xl" 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="px-10"
          >
            {isGenerating ? "Generating..." : "Generate Document"}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>

        {/* Ad Banner - Top (Replace slot with your Homepage Top ad unit ID) */}
        <AdContainer position="inline" className="w-full max-w-2xl">
          <AdBanner slot="HOMEPAGE_TOP_SLOT" format="horizontal" />
        </AdContainer>

        {/* Divider */}
        <div className="w-full max-w-lg h-px bg-gradient-to-r from-transparent via-border/30 to-transparent my-8" />

        {/* Mobile App Section */}
        <div className="text-center animate-fade-up" style={{ animationDelay: "0.5s" }}>
          <p className="text-muted-foreground mb-6 flex items-center justify-center gap-2">
            <Smartphone className="h-4 w-4" />
            Get the full experience on mobile
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {/* Expo Go Button */}
            <a 
              href="#" 
              className="flex items-center gap-3 px-5 py-3 bg-card/10 backdrop-blur-sm border border-border/30 rounded-xl hover:bg-card/20 transition-colors"
            >
              <div className="w-8 h-8 bg-foreground/10 rounded-lg flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-foreground/80" />
              </div>
              <span className="text-foreground/80 font-medium">Open in Expo Go</span>
            </a>

            {/* App Store Button */}
            <a 
              href="https://apps.apple.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3 bg-card/10 backdrop-blur-sm border border-border/30 rounded-xl hover:bg-card/20 transition-colors"
            >
              <div className="w-8 h-8 bg-foreground/10 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-foreground/80" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </div>
              <span className="text-foreground/80 font-medium">App Store</span>
            </a>

            {/* Google Play Button */}
            <a 
              href="https://play.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3 bg-legal-gold text-legal-navy rounded-xl hover:brightness-110 transition-all font-semibold"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              <span>Google Play</span>
            </a>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-12 max-w-xl text-center animate-fade-up" style={{ animationDelay: "0.6s" }}>
          <div className="bg-legal-gold/10 border border-legal-gold/20 rounded-xl px-6 py-4">
            <p className="text-sm text-muted-foreground">
              LegallyAI generates templates for informational purposes only. This is not legal advice. 
              Please consult a licensed attorney for your specific legal needs.
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <Link to="/chat" className="text-muted-foreground hover:text-legal-gold transition-colors">
            AI Chat
          </Link>
          <span className="text-muted-foreground/30">•</span>
          <Link to="/custody" className="text-muted-foreground hover:text-legal-gold transition-colors">
            Custody Helper
          </Link>
          <span className="text-muted-foreground/30">•</span>
          <Link to="/lawyers" className="text-muted-foreground hover:text-legal-gold transition-colors">
            For Lawyers
          </Link>
          <span className="text-muted-foreground/30">•</span>
          <Link to="/pricing" className="text-muted-foreground hover:text-legal-gold transition-colors">
            Pricing
          </Link>
          <span className="text-muted-foreground/30">•</span>
          <Link to="/login" className="text-muted-foreground hover:text-legal-gold transition-colors">
            Login
          </Link>
        </div>

        {/* Bottom Ad Banner (Replace slot with your Homepage Bottom ad unit ID) */}
        <AdContainer position="bottom" className="w-full max-w-2xl mt-8">
          <AdBanner slot="HOMEPAGE_BOTTOM_SLOT" format="horizontal" />
        </AdContainer>
      </div>
    </div>
  );
}
