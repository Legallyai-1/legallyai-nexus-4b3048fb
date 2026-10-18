import { useEffect, useRef } from "react";
import type { MLCEngineInterface } from "@mlc-ai/web-llm";
import { Cpu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { detectWebGPU, loadPrivateAI, PRIVATE_AI_LABEL, PRIVATE_AI_STORAGE_KEY } from "@/lib/privateAI";

export type PrivateAIState =
  | { status: "off" }
  | { status: "unsupported" }
  | { status: "loading"; progress: number; text: string }
  | { status: "ready" }
  | { status: "error"; message: string };

interface Props {
  state: PrivateAIState;
  onStateChange: (state: PrivateAIState) => void;
  onEngine: (engine: MLCEngineInterface | null) => void;
  disabled?: boolean;
}

export function PrivateAIToggle({ state, onStateChange, onEngine, disabled }: Props) {
  const startedRef = useRef(false);

  const enable = async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    const gpu = await detectWebGPU();
    if (!gpu.supported) {
      startedRef.current = false;
      onStateChange({ status: "unsupported" });
      return;
    }
    onStateChange({ status: "loading", progress: 0, text: "Starting…" });
    try {
      const engine = await loadPrivateAI((progress, text) => onStateChange({ status: "loading", progress, text }));
      onEngine(engine);
      onStateChange({ status: "ready" });
      try { localStorage.setItem(PRIVATE_AI_STORAGE_KEY, "1"); } catch { /* storage unavailable */ }
    } catch (error) {
      startedRef.current = false;
      onEngine(null);
      onStateChange({ status: "error", message: error instanceof Error ? error.message : "Private AI could not start." });
    }
  };

  const disable = () => {
    onEngine(null);
    onStateChange({ status: "off" });
    startedRef.current = false;
    try { localStorage.removeItem(PRIVATE_AI_STORAGE_KEY); } catch { /* storage unavailable */ }
  };

  // Re-enable automatically for returning visitors; the model is cached by the browser.
  useEffect(() => {
    let remembered = false;
    try { remembered = localStorage.getItem(PRIVATE_AI_STORAGE_KEY) === "1"; } catch { /* storage unavailable */ }
    if (remembered) void enable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="glass-card rounded-xl border border-border px-4 py-3 mb-3 flex flex-wrap items-center gap-3 text-sm" aria-live="polite">
      <Cpu aria-hidden="true" className="h-4 w-4 shrink-0 text-neon-cyan" />
      <div className="flex-1 min-w-[12rem]">
        <p className="font-medium">Private AI {state.status === "ready" ? "is on" : "(free, beta)"}</p>
        <p className="text-xs text-muted-foreground">
          {state.status === "ready" && `${PRIVATE_AI_LABEL}. Answers are written on this device from the LegallyAI legal guide.`}
          {state.status === "off" && "Runs an open-source AI model on your device. First use downloads about 700 MB, then it is cached. Best on a laptop or desktop with Chrome or Edge."}
          {state.status === "unsupported" && "This browser or device does not support WebGPU, so Private AI cannot run here. You still get answers from the legal guide."}
          {state.status === "loading" && `Downloading and starting the model: ${Math.round(state.progress * 100)}%. You can keep chatting meanwhile.`}
          {state.status === "error" && `Private AI could not start (${state.message}). You still get answers from the legal guide.`}
        </p>
      </div>
      {state.status === "loading" ? (
        <Loader2 aria-label="Loading Private AI" className="h-5 w-5 animate-spin" />
      ) : state.status === "ready" ? (
        <Button size="sm" variant="outline" onClick={disable} disabled={disabled}>Turn off</Button>
      ) : state.status === "unsupported" ? null : (
        <Button size="sm" variant="outline" onClick={() => void enable()} disabled={disabled}>Turn on</Button>
      )}
    </div>
  );
}

export default PrivateAIToggle;
