import { cn } from "@/lib/utils";

interface LeeAvatarProps {
  /** Rendered image height (Tailwind class), e.g. "h-40 sm:h-48". */
  heightClass?: string;
  /** Empty alt hides Lee from screen readers when a heading already names him. */
  alt?: string;
  /** @deprecated No effect: Lee has no aura, ring, sparkles or rays behind him any more (Dakota, Oct 29). */
  stage?: boolean;
  priority?: boolean;
  /** "sm" uses the lighter 64px image for small placements. */
  imageSize?: "sm" | "lg";
  className?: string;
}

// Lee, alive: only the gentle float and slight sway Dakota likes (see .animate-lee-alive).
// Nothing behind Lee: no sunburst, rays, aura, ring, sparkles or gold halo (Dakota, Oct 29).
// All motion stops under prefers-reduced-motion (see index.css).
export function LeeAvatar({ heightClass = "h-40", alt = "", priority = false, imageSize = "lg", className }: LeeAvatarProps) {
  const small = imageSize === "sm";
  return (
    <span className={cn("lee-stage relative inline-flex items-end justify-center", className)}>
      <span className="relative inline-block">
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

const WAVE = [4, 7, 11, 16, 22, 26, 18, 12, 24, 30, 20, 13, 9, 15, 23, 28, 17, 10, 6, 4];

/** Decorative gold audio-wave line used under Lee in chat panels. */
export function GoldWave({ className }: { className?: string }) {
  return (
    <div className={cn("gold-wave", className)} aria-hidden="true">
      {WAVE.map((h, i) => <span key={i} style={{ height: `${h}px`, animationDelay: `${(i % 7) * 0.12}s` }} />)}
    </div>
  );
}

export default LeeAvatar;
