import { lazy, type ComponentType, type LazyExoticComponent } from "react";

// After a deploy, tabs still running the old index.html ask for hashed chunks that no
// longer exist ("Failed to fetch dynamically imported module" / ChunkLoadError).
// Recover with ONE hard reload (which fetches the new HTML). sessionStorage guards
// against reload loops: if we already reloaded in the last minute, surface the error
// to ChunkErrorBoundary instead, which offers a manual Reload button.
const RELOAD_KEY = "legallyai:chunk-reload-at";
const RELOAD_WINDOW_MS = 60_000;

export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  const e = error as { name?: string; message?: string };
  const text = `${e.name ?? ""} ${e.message ?? String(error)}`;
  return /ChunkLoadError|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS/i.test(
    text,
  );
}

/** Returns true when a reload was triggered (caller should stop rendering). */
export function reloadOnceForChunkError(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const last = Number(window.sessionStorage.getItem(RELOAD_KEY) || 0);
    if (last && Date.now() - last < RELOAD_WINDOW_MS) return false;
    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // sessionStorage blocked (private mode): never auto-reload, so no loop is possible.
    return false;
  }
  window.location.reload();
  return true;
}

export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      if (isChunkLoadError(error) && reloadOnceForChunkError()) {
        // Page is reloading; keep Suspense showing the loader until it does.
        return new Promise<{ default: T }>(() => {});
      }
      throw error;
    }
  });
}

// Vite fires this when a preloaded dependency of a dynamic import fails.
if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", (event) => {
    if (reloadOnceForChunkError()) event.preventDefault();
  });
}
