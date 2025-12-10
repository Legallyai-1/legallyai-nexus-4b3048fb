import { cn } from "@/lib/utils";

interface AnimatedAIHeadProps {
  variant?: "cyan" | "purple" | "pink" | "green" | "orange" | "blue";
  size?: "sm" | "md" | "lg";
  className?: string;
  isActive?: boolean;
}

const colorVariants = {
  cyan: {
    primary: "hsl(187, 100%, 50%)",
    secondary: "hsl(199, 89%, 48%)",
    glow: "hsl(187, 100%, 50%)",
  },
  purple: {
    primary: "hsl(280, 100%, 65%)",
    secondary: "hsl(260, 100%, 55%)",
    glow: "hsl(280, 100%, 65%)",
  },
  pink: {
    primary: "hsl(330, 100%, 65%)",
    secondary: "hsl(350, 100%, 55%)",
    glow: "hsl(330, 100%, 65%)",
  },
  green: {
    primary: "hsl(150, 100%, 50%)",
    secondary: "hsl(170, 100%, 45%)",
    glow: "hsl(150, 100%, 50%)",
  },
  orange: {
    primary: "hsl(25, 100%, 55%)",
    secondary: "hsl(35, 100%, 50%)",
    glow: "hsl(25, 100%, 55%)",
  },
  blue: {
    primary: "hsl(210, 100%, 60%)",
    secondary: "hsl(220, 100%, 55%)",
    glow: "hsl(210, 100%, 60%)",
  },
};

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-24 h-24",
};

export function AnimatedAIHead({ 
  variant = "cyan", 
  size = "md", 
  className,
  isActive = true 
}: AnimatedAIHeadProps) {
  const colors = colorVariants[variant];
  
  return (
    <div className={cn(
      sizeClasses[size],
      "relative flex items-center justify-center",
      isActive && "animate-head-bob",
      className
    )}>
      {/* Outer Glow Ring */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full opacity-30",
          isActive && "animate-pulse-glow"
        )}
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
        }}
      />
      
      {/* Background Circle with Gradient */}
      <div 
        className="absolute inset-1 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}10 100%)`,
          border: `2px solid ${colors.primary}40`,
        }}
      />
      
      {/* SVG Wireframe Head */}
      <svg
        viewBox="0 0 100 100"
        className={cn(
          "relative z-10 w-full h-full p-2",
          isActive && "animate-neural-pulse"
        )}
        style={{ filter: `drop-shadow(0 0 8px ${colors.glow})` }}
      >
        {/* Neural Network Lines */}
        <g stroke={colors.primary} strokeWidth="0.5" fill="none" opacity="0.6">
          {/* Head outline - wireframe style */}
          <ellipse cx="50" cy="45" rx="25" ry="30" strokeDasharray="4 2">
            <animate
              attributeName="stroke-dashoffset"
              from="100"
              to="0"
              dur="3s"
              repeatCount="indefinite"
            />
          </ellipse>
          
          {/* Inner circuit lines */}
          <path d="M 35 35 Q 50 30 65 35" strokeDasharray="3 2">
            <animate
              attributeName="stroke-dashoffset"
              from="50"
              to="0"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
          <path d="M 35 55 Q 50 60 65 55" strokeDasharray="3 2">
            <animate
              attributeName="stroke-dashoffset"
              from="50"
              to="0"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </path>
          
          {/* Vertical connection lines */}
          <line x1="40" y1="25" x2="40" y2="65" strokeDasharray="2 3">
            <animate
              attributeName="stroke-dashoffset"
              from="40"
              to="0"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="60" y1="25" x2="60" y2="65" strokeDasharray="2 3">
            <animate
              attributeName="stroke-dashoffset"
              from="40"
              to="0"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="50" y1="20" x2="50" y2="70" strokeDasharray="2 3">
            <animate
              attributeName="stroke-dashoffset"
              from="50"
              to="0"
              dur="2s"
              repeatCount="indefinite"
            />
          </line>
        </g>

        {/* Eyes */}
        <g fill={colors.primary}>
          {/* Left Eye */}
          <ellipse cx="40" cy="40" rx="5" ry="4">
            <animate
              attributeName="ry"
              values="4;0.5;4"
              dur="4s"
              repeatCount="indefinite"
              keyTimes="0;0.05;0.1"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
            />
          </ellipse>
          {/* Left Eye Glow */}
          <ellipse cx="40" cy="40" rx="3" ry="2" fill={colors.secondary} opacity="0.8">
            <animate
              attributeName="opacity"
              values="0.8;1;0.8"
              dur="2s"
              repeatCount="indefinite"
            />
          </ellipse>
          
          {/* Right Eye */}
          <ellipse cx="60" cy="40" rx="5" ry="4">
            <animate
              attributeName="ry"
              values="4;0.5;4"
              dur="4s"
              repeatCount="indefinite"
              keyTimes="0;0.05;0.1"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
            />
          </ellipse>
          {/* Right Eye Glow */}
          <ellipse cx="60" cy="40" rx="3" ry="2" fill={colors.secondary} opacity="0.8">
            <animate
              attributeName="opacity"
              values="0.8;1;0.8"
              dur="2s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>

        {/* Neural nodes */}
        <g fill={colors.primary}>
          <circle cx="30" cy="30" r="2" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="70" cy="30" r="2" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.7s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="70" r="2" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="35" cy="60" r="1.5" opacity="0.4">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.3s" repeatCount="indefinite" />
          </circle>
          <circle cx="65" cy="60" r="1.5" opacity="0.4">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.6s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Mouth / Speaking indicator */}
        <rect 
          x="45" 
          y="55" 
          width="10" 
          height="2" 
          rx="1" 
          fill={colors.primary}
          opacity="0.7"
        >
          <animate
            attributeName="width"
            values="10;14;10"
            dur="0.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x"
            values="45;43;45"
            dur="0.5s"
            repeatCount="indefinite"
          />
        </rect>

        {/* Orbiting particle */}
        <circle r="2" fill={colors.secondary} opacity="0.8">
          <animateMotion
            path="M 50 20 A 30 25 0 1 1 50 70 A 30 25 0 1 1 50 20"
            dur="6s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
}

export default AnimatedAIHead;
