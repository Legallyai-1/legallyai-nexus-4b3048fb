import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Copy, Download, Smartphone, Mic, Sparkles } from "lucide-react";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import AdBanner from "@/components/ads/AdBanner";
import AdContainer from "@/components/ads/AdContainer";

export default function Index() {
  const [prompt, setPrompt] = useState("");
  const [document, setDocument] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    navigate(`/generate?prompt=${encodeURIComponent(prompt)}`);
  };

  const copyToClipboard = () => {
    if (document) {
      navigator.clipboard.writeText(document);
    }
  };

  return (
    <FuturisticBackground variant="dense">
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* AI Head with Glow */}
        <div className="mb-6 animate-fade-up relative">
          <div className="absolute inset-0 bg-neon-cyan/20 blur-3xl rounded-full scale-150" />
          <AnimatedAIHead variant="cyan" size="lg" />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-center mb-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <span className="text-foreground">Legally</span>
          <span className="text-neon-cyan text-glow-cyan">AI</span>
        </h1>

        {/* Tagline */}
        <p className="text-lg md:text-xl text-muted-foreground text-center mb-2 animate-fade-up flex items-center gap-2" style={{ animationDelay: "0.2s" }}>
          <Sparkles className="w-5 h-5 text-neon-cyan" />
          Your AI Legal Assistant
          <Sparkles className="w-5 h-5 text-neon-cyan" />
        </p>
        <p className="text-sm text-neon-cyan/70 text-center mb-10 animate-fade-up" style={{ animationDelay: "0.25s" }}>
          Professional legal documents and guidance in seconds
        </p>

        {/* Document Output (shown after generation) */}
        {document && (
          <div className="w-full max-w-2xl mb-8 animate-fade-up">
            <div className="glass-card rounded-2xl p-6 border-neon-cyan/20">
              <h2 className="text-lg font-display font-semibold text-neon-cyan mb-4">Legal Document Generated</h2>
              <div className="bg-background/30 rounded-xl p-4 mb-4 max-h-64 overflow-y-auto border border-border/30">
                <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-body">{document}</pre>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="neon-outline" 
                  size="sm" 
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button 
                  variant="neon" 
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
          <div className="glass-card rounded-2xl p-1 border-neon-cyan/30 hover:border-neon-cyan/50 transition-all hover:shadow-glow-sm">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Create NDA for California startup hiring Texas developer..."
              className="w-full min-h-[120px] bg-transparent border-0 text-foreground placeholder:text-muted-foreground/50 resize-none focus:ring-0 focus-visible:ring-0 text-base p-4"
            />
            <div className="flex items-center justify-between px-4 pb-3 text-sm text-muted-foreground">
              <span>{prompt.length} characters</span>
              <button className="p-2 rounded-lg hover:bg-neon-cyan/10 transition-colors text-neon-cyan">
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <Button 
            variant="neon" 
            size="xl" 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="px-12"
          >
            {isGenerating ? "Generating..." : "Generate Document"}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>

        {/* Ad Banner */}
        <AdContainer position="inline" className="w-full max-w-2xl mt-8">
          <AdBanner slot="HOMEPAGE_TOP_SLOT" format="horizontal" />
        </AdContainer>

        {/* Feature Links - Glassmorphism Cards */}
        <div className="w-full max-w-3xl mt-12 animate-fade-up" style={{ animationDelay: "0.5s" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "AI Chat", path: "/chat", icon: "💬", color: "cyan" },
              { name: "Custody", path: "/custody", icon: "👨‍👩‍👧", color: "purple" },
              { name: "Lawyers", path: "/lawyers", icon: "⚖️", color: "green" },
              { name: "Pricing", path: "/pricing", icon: "💎", color: "orange" },
            ].map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={`glass-card-hover rounded-xl p-4 text-center group`}
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <span className={`text-sm font-medium text-neon-${item.color} group-hover:text-glow-${item.color}`}>
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full max-w-lg h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent my-10" />

        {/* Mobile App Section */}
        <div className="text-center animate-fade-up" style={{ animationDelay: "0.6s" }}>
          <p className="text-muted-foreground mb-6 flex items-center justify-center gap-2">
            <Smartphone className="h-4 w-4 text-neon-cyan" />
            Get the full experience on mobile
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {/* App Store Button */}
            <a 
              href="https://apps.apple.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="glass-card-hover flex items-center gap-3 px-5 py-3 rounded-xl"
            >
              <div className="w-8 h-8 bg-neon-cyan/10 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-neon-cyan" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </div>
              <span className="text-foreground font-medium">App Store</span>
            </a>

            {/* Google Play Button */}
            <a 
              href="https://play.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-neon-cyan to-neon-blue text-background rounded-xl hover:shadow-glow-md hover:scale-105 transition-all font-semibold"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              <span>Google Play</span>
            </a>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-12 max-w-xl text-center animate-fade-up" style={{ animationDelay: "0.7s" }}>
          <div className="glass-card rounded-xl px-6 py-4 border-neon-purple/20">
            <p className="text-sm text-muted-foreground">
              ⚠️ LegallyAI generates templates for informational purposes only. This is not legal advice. 
              Please consult a licensed attorney for your specific legal needs.
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          {[
            { name: "AI Chat", path: "/chat" },
            { name: "Custody Helper", path: "/custody" },
            { name: "For Lawyers", path: "/lawyers" },
            { name: "Pricing", path: "/pricing" },
            { name: "Login", path: "/login" },
          ].map((link, i) => (
            <span key={link.path} className="flex items-center gap-4">
              <Link 
                to={link.path} 
                className="text-muted-foreground hover:text-neon-cyan transition-colors"
              >
                {link.name}
              </Link>
              {i < 4 && <span className="text-border">•</span>}
            </span>
          ))}
        </div>

        {/* Bottom Ad Banner */}
        <AdContainer position="bottom" className="w-full max-w-2xl mt-8">
          <AdBanner slot="HOMEPAGE_BOTTOM_SLOT" format="horizontal" />
        </AdContainer>
      </div>
    </FuturisticBackground>
  );
}
