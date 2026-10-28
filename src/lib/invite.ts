export const buildInviteAcceptancePath = (token: string) =>
  `/accept-invite?token=${encodeURIComponent(token)}`;

export const getInviteAcceptanceReturnTo = (returnTo: string | null, origin: string) => {
  if (!returnTo) return null;
  try {
    const destination = new URL(returnTo, origin);
    if (destination.origin !== origin) return null;
    // Pricing is a safe return destination, never an automatic purchase.
    if (destination.pathname === "/pricing" && !destination.search && !destination.hash) {
      return "/pricing";
    }
    if (destination.pathname !== "/accept-invite" || !destination.searchParams.has("token")) {
      return null;
    }
    return `${destination.pathname}${destination.search}`;
  } catch {
    return null;
  }
};
