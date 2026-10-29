import { cn } from "@/lib/utils";

interface LeeAvatarProps {
  /** Rendered image height (Tailwind class), e.g. "h-40 sm:h-48". */
  heightClass?: string;
  /** Empty alt hides Lee from screen readers when a heading already names him. */
  alt?: string;
  /** Show the gold pulse ring + sparkles (use for hero / panel sizes, not tiny icons). */
  stage?: boolean;
  priority?: boolean;
  /** "sm" uses the lighter 64px image for small placements. */
  imageSize?: "sm" | "lg";
  className?: string;
}

// Lee, alive: the animation Dakota liked on the Oct 23 dashboard (float, sway, breathing gold glow,
// see .animate-lee-alive) plus a periodic hello-wave tilt, a soft pulse ring and twinkling sparkles.
// All motion stops under prefers-reduced-motion (see index.css).
export function LeeAvatar({ heightClass = "h-40", alt = "", stage = true, priority = false, imageSize = "lg", className }: LeeAvatarProps) {
  const small = imageSize === "sm";
  return (
    <span className={cn("lee-stage relative inline-flex items-end justify-center", className)}>
      {stage && (
        <>
          <span className="lee-aura" aria-hidden="true" />
          <span className="lee-ring" aria-hidden="true" />
          <span className="lai-sparkle" style={{ top: "12%", left: "10%", animationDelay: "0.2s" }} aria-hidden="true" />
          <span className="lai-sparkle" style={{ top: "6%", right: "14%", animationDelay: "1.1s" }} aria-hidden="true" />
          <span className="lai-sparkle" style={{ bottom: "28%", right: "4%", animationDelay: "1.9s" }} aria-hidden="true" />
        </>
      )}
      <span className="lee-wave relative inline-block">
        <img
          src={small ? "/lee-mascot-sm.png" : "/lee-mascot.png"}
          alt={alt}
          aria-hidden={alt ? undefined : true}
          width={small ? 64 : 240}
          height={small ? 96 : 360}
          className={cn("relative w-auto animate-lee-alive select-none", heightClass)}
          draggable={false}
          {...(priority ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
        />
      </span>
    </span>
  );
}

export default LeeAvatar;
