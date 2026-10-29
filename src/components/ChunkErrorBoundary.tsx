import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { isChunkLoadError } from "@/lib/lazyWithRetry";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Catches render/lazy-load failures for a route so users never see a blank page.
export class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Route failed to load", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const updated = isChunkLoadError(error);
    return (
      <div role="alert" className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card/80 backdrop-blur p-8 text-center space-y-4 shadow-sm">
          <h1 className="text-xl font-semibold">
            {updated ? "LegallyAI was just updated" : "This page couldn't load"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {updated
              ? "A newer version of the site is available. Reload to continue."
              : "Something went wrong while loading this page. Reloading usually fixes it."}
          </p>
          <Button onClick={() => window.location.reload()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Reload
          </Button>
        </div>
      </div>
    );
  }
}
