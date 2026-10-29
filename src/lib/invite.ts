export const buildInviteAcceptancePath = (token: string) =>
  `/accept-invite?token=${encodeURIComponent(token)}`;

export const PRICING_RETURN_PLANS = new Set(["premium", "document", "solo", "firm", "enterprise"]);

export const getInviteAcceptanceReturnTo = (returnTo: string | null, origin: string) => {
  if (!returnTo) return null;
  try {
    const destination = new URL(returnTo, origin);
    if (destination.origin !== origin) return null;
    // Pricing is a safe return destination, never an automatic purchase.
    if (destination.pathname === "/pricing" && !destination.hash) {
      if (!destination.search) return "/pricing";
      // A known plan only preselects it on the pricing page; the user still clicks to check out.
      const plan = destination.searchParams.get("plan");
      if ([...destination.searchParams.keys()].length === 1 && plan && PRICING_RETURN_PLANS.has(plan)) {
        return `/pricing?plan=${plan}`;
      }
      return null;
    }
    if (destination.pathname !== "/accept-invite" || !destination.searchParams.has("token")) {
      return null;
    }
    return `${destination.pathname}${destination.search}`;
  } catch {
    return null;
  }
};
