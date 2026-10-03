export const buildInviteAcceptancePath = (token: string) =>
  `/accept-invite?token=${encodeURIComponent(token)}`;

export const getInviteAcceptanceReturnTo = (returnTo: string | null, origin: string) => {
  if (!returnTo) return null;

  try {
    const destination = new URL(returnTo, origin);
    if (
      destination.origin !== origin ||
      destination.pathname !== "/accept-invite" ||
      !destination.searchParams.has("token")
    ) {
      return null;
    }

    return `${destination.pathname}${destination.search}`;
  } catch {
    return null;
  }
};
