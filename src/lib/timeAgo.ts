import { formatDistanceToNow } from "date-fns";

/**
 * "3 hours ago" for a timestamp, without throwing on a missing or invalid value
 * (date-fns throws RangeError: Invalid time value, which used to crash /dashboard).
 */
export function formatTimeAgo(
  value: string | number | Date | null | undefined,
  fallback = "Recently",
): string {
  if (value === null || value === undefined || value === "") return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return formatDistanceToNow(date, { addSuffix: true });
}
