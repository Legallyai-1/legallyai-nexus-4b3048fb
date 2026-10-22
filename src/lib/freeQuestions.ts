export const FREE_LIMIT_EVENT = "legallyai:free-limit";
export const FREE_USAGE_EVENT = "legallyai:free-usage";

export interface FreeLimitDetail { limit: number; used: number; signedIn: boolean }

export class FreeLimitError extends Error {
  constructor(public detail: FreeLimitDetail, message: string) {
    super(message);
    this.name = "FreeLimitError";
  }
}

export function announceFreeLimit(detail: FreeLimitDetail) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(FREE_LIMIT_EVENT, { detail }));
}

export function announceFreeUsage(used: number, limit: number) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(FREE_USAGE_EVENT, { detail: { used, limit } }));
}
