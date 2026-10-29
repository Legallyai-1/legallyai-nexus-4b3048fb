import { cn } from "@/lib/utils";

interface FuturisticBackgroundProps {
  variant?: "default" | "dense" | "minimal";
  className?: string;
  children?: React.ReactNode;
}

export function FuturisticBackground({ 
  variant = "default", 
  className,
  children 
}: FuturisticBackgroundProps) {
  const particleCount = variant === "dense" ? 80 : variant === "minimal" ? 30 : 50;
  
  return (
    <div className={cn(
      "min-h-screen relative overflow-hidden",
      // Transparent: the frosted soft-blue page background (body.hub-bg) shows through.
      "bg-transparent",
      className
    )}>
      {/* Base gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-neon-cyan/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-neon-purple/5" 
        style={{ backgroundPosition: 'bottom right' }} 
      />
      
      {/* Neural network grid pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--neon-cyan) / 0.03) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--neon-cyan) / 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(particleCount)].map((_, i) => {
          const isGlowParticle = i % 5 === 0;
          const colorIndex = i % 4;
          const colors = [
            'hsl(43 95% 55%)',  // gold
            'hsl(210 70% 60%)', // soft blue
            'hsl(214 20% 70%)', // silver
            'hsl(45 95% 65%)',  // light gold
          ];
          
          return (
            <div
              key={i}
              className={cn(
                "absolute rounded-full",
                isGlowParticle && "animate-pulse-glow"
              )}
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                backgroundColor: colors[colorIndex],
                opacity: Math.random() * 0.3 + 0.15,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 6 + 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 6}s`,
                boxShadow: isGlowParticle 
                  ? `0 0 10px ${colors[colorIndex]}, 0 0 20px ${colors[colorIndex]}40`
                  : 'none',
              }}
            />
          );
        })}
      </div>
      
      {/* Floating orbs for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl animate-float-slow"
          style={{
            background: 'radial-gradient(circle, hsl(43 95% 60%) 0%, transparent 70%)',
            top: '10%',
            left: '20%',
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full opacity-10 blur-3xl animate-float"
          style={{
            background: 'radial-gradient(circle, hsl(210 70% 65%) 0%, transparent 70%)',
            bottom: '20%',
            right: '15%',
            animationDelay: '2s',
          }}
        />
        <div 
          className="absolute w-64 h-64 rounded-full opacity-5 blur-2xl animate-float-slow"
          style={{
            background: 'radial-gradient(circle, hsl(210 100% 60%) 0%, transparent 70%)',
            top: '50%',
            left: '60%',
            animationDelay: '4s',
          }}
        />
      </div>

      {/* Scan lines effect (subtle) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            hsl(var(--neon-cyan) / 0.5) 2px,
            hsl(var(--neon-cyan) / 0.5) 4px
          )`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export default FuturisticBackground;
