export const FREE_LIMIT_EVENT = "legallyai:free-limit";
export const FREE_USAGE_EVENT = "legallyai:free-usage";

export interface FreeLimitDetail { limit: number; used: number; signedIn: boolean }

export class FreeLimitError extends Error {
  detail: FreeLimitDetail;
  constructor(detail: FreeLimitDetail, message: string) {
    super(message);
    this.detail = detail;
    this.name = "FreeLimitError";
  }
}

export function announceFreeLimit(detail: FreeLimitDetail) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(FREE_LIMIT_EVENT, { detail }));
}

export function announceFreeUsage(used: number, limit: number) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(FREE_USAGE_EVENT, { detail: { used, limit } }));
}

const DEVICE_KEY = "legallyai:device-id";

/**
 * Random per-browser id used only to count anonymous free questions per device (the server hashes it
 * and also caps each network). Returns null when storage is unavailable; the server then counts by network.
 */
export function getDeviceId(storage: Pick<Storage, "getItem" | "setItem"> | null = typeof window !== "undefined" ? window.localStorage : null): string | null {
  try {
    if (!storage) return null;
    const existing = storage.getItem(DEVICE_KEY);
    if (existing && /^[A-Za-z0-9-]{16,64}$/.test(existing)) return existing;
    const id = globalThis.crypto?.randomUUID?.();
    if (!id) return null;
    storage.setItem(DEVICE_KEY, id);
    return id;
  } catch {
    return null;
  }
}
