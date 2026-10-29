import { LeeAvatar } from "@/components/brand/LeeAvatar";

// Lee, centered in an empty chat with nothing behind him (no rays or glow).
export function LeeGreeting({ name = "Lee", line = "How can I assist you today?" }: { name?: string; line?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-3">
      <LeeAvatar heightClass="h-36 sm:h-44" alt={`${name}, the LegallyAI assistant`} />
      <p className="relative mt-2 font-display text-lg font-bold text-foreground">{name} <span className="text-muted-foreground">·</span> <span className="lee-partner-title-accent">AI Partner</span></p>
      <p className="relative text-sm font-semibold text-foreground">{line}</p>
      <p className="relative mt-0.5 text-xs text-muted-foreground">I&apos;m {name}. Ask in plain English and include your state.</p>
    </div>
  );
}

export default LeeGreeting;
