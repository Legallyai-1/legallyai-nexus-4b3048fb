import { Link } from "react-router-dom";
import { FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  className?: string;
}

export function FloatingActionButton({ className }: FloatingActionButtonProps) {
  return (
    <Link
      to="/generate"
      className={cn(
        "fixed bottom-24 right-4 lg:bottom-8 lg:right-8 z-40 group",
        className
      )}
    >
      {/* Outer glow ring - pulsing */}
      <div className="absolute inset-0 bg-legal-cyan/30 rounded-full blur-xl animate-pulse scale-150" />
      
      {/* Middle glow ring */}
      <div className="absolute inset-0 bg-legal-gold/20 rounded-full blur-md scale-125 group-hover:scale-150 transition-transform duration-500" />
      
      {/* Orbiting particle */}
      <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
        <div className="absolute -top-1 left-1/2 w-2 h-2 bg-legal-cyan rounded-full shadow-[0_0_8px_hsl(var(--legal-cyan))]" />
      </div>
      
      {/* Second orbiting particle */}
      <div className="absolute inset-0 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}>
        <div className="absolute top-1/2 -right-1 w-1.5 h-1.5 bg-legal-gold rounded-full shadow-[0_0_6px_hsl(var(--legal-gold))]" />
      </div>
      
      {/* Main button */}
      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-legal-gold via-legal-gold/90 to-legal-gold/80 shadow-[0_0_30px_hsl(var(--legal-gold)/0.5)] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_40px_hsl(var(--legal-gold)/0.7)]">
        {/* Inner glow */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
        
        {/* Icon */}
        <FileText className="relative h-6 w-6 text-background transition-transform duration-300 group-hover:scale-110" />
        
        {/* Sparkle accent */}
        <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-legal-cyan animate-pulse" />
      </div>
      
      {/* Tooltip */}
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
        <div className="bg-background/90 backdrop-blur-sm border border-legal-cyan/30 rounded-lg px-3 py-2 whitespace-nowrap shadow-[0_0_20px_hsl(var(--legal-cyan)/0.2)]">
          <span className="text-sm font-medium text-foreground">Generate Document</span>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-background border-r border-t border-legal-cyan/30 rotate-45" />
        </div>
      </div>
    </Link>
  );
}
