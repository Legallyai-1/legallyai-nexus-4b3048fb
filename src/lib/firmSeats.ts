/** Seat usage from business-hub; limit is null when the owner's plan has no seat allowance. */
export interface FirmSeats {
  planName: string;
  limit: number | null;
  members: number;
  pendingInvites: number;
  used: number;
}

/** True when every seat on the plan is taken (members + pending invites). */
export function seatsFull(seats: FirmSeats | null | undefined): boolean {
  return Boolean(seats && seats.limit !== null && seats.used >= seats.limit);
}

export function seatSummary(seats: FirmSeats): string {
  if (seats.limit === null) return `${seats.planName} plan`;
  const pending = seats.pendingInvites ? ` (${seats.pendingInvites} pending invite${seats.pendingInvites === 1 ? "" : "s"})` : "";
  return `${seats.planName} plan · ${seats.used} of ${seats.limit} seat${seats.limit === 1 ? "" : "s"} used${pending}`;
}
