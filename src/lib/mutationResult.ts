// Supabase returns success with zero rows when RLS or a stale id blocks an update/delete.
// Use with `.select('id')` on the mutation so the UI never reports a change that did not happen.
export class NoRowsAffectedError extends Error {
  constructor(action: string) {
    super(`Nothing was ${action}. It may have been removed already, or you may not have permission.`);
    this.name = 'NoRowsAffectedError';
  }
}

export function requireAffectedRows<T>(data: T[] | null | undefined, action: string): T[] {
  if (!Array.isArray(data) || data.length === 0) throw new NoRowsAffectedError(action);
  return data;
}

export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === 'object' && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message || fallback;
  }
  return fallback;
}
