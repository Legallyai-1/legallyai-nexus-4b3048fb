// Lee floating inside an empty chat box with a speech bubble (new LegallyAI design).
export function LeeGreeting({ name = "Lee", line = "How can I assist you today?" }: { name?: string; line?: string }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-4">
      <img src="/lee-mascot.png" alt={`${name}, the LegallyAI assistant`} width={120} height={180} className="h-32 sm:h-36 w-auto animate-lee-alive drop-shadow-[0_14px_28px_hsl(222_60%_5%/0.6)]" draggable={false} />
      <div className="relative max-w-xs rounded-2xl sm:rounded-bl-sm border border-white/30 bg-white/95 px-4 py-3 text-slate-800 shadow-xl">
        <p className="text-sm font-semibold">{line}</p>
        <p className="mt-1 text-xs text-slate-500">I&apos;m {name}. Ask in plain English and include your state.</p>
      </div>
    </div>
  );
}

export default LeeGreeting;
