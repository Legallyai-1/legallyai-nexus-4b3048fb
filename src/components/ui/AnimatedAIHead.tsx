import { cn } from "@/lib/utils";

interface AnimatedAIHeadProps {
  variant?: "cyan" | "purple" | "pink" | "green" | "orange" | "blue";
  size?: "sm" | "md" | "lg";
  className?: string;
  isActive?: boolean;
}

// Lee's face everywhere on the site: the LegallyAI mascot, gently floating, with a gold glow while working.
// (Kept the original name and props so all existing pages pick up the new design automatically.)
const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-28 h-28",
};

export function AnimatedAIHead({ size = "md", className, isActive = true }: AnimatedAIHeadProps) {
  return (
    <div className={cn("relative shrink-0 flex items-center justify-center", sizeClasses[size], className)} aria-hidden="true">
      <div className={cn("absolute inset-0 rounded-full bg-[hsl(45_90%_60%/0.25)] blur-md", isActive ? "animate-pulse" : "opacity-60")} />
      <img
        src={size === "lg" ? "/lee-mascot.png" : "/lee-mascot-sm.png"}
        alt=""
        className={cn("relative h-full w-full object-contain drop-shadow-[0_6px_14px_hsl(222_60%_5%/0.55)]", isActive && "animate-lee-alive")}
        loading="lazy"
        draggable={false}
      />
    </div>
  );
}

export default AnimatedAIHead;
