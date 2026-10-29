export type AppRole = "owner" | "admin" | "manager" | "lawyer" | "paralegal" | "employee" | "client";

// Default landing after sign-in. Owners/admins land on the dashboard too: anyone who creates a
// workspace becomes its owner, so /admin (firm settings) is opened from the sidebar, not on login.
export const ROLE_TO_PATH: Record<AppRole, string> = {
  owner: "/dashboard", admin: "/dashboard", manager: "/dashboard",
  lawyer: "/dashboard", paralegal: "/dashboard",
  employee: "/employee", client: "/client-portal",
};

// Signed-in users with no firm role, client record or membership go to the home page
// (Ask Lee + hubs), not a sub-page like /ai-assistants.
export const NO_ROLE_PATH = "/";

export function pathForRole(role: string | null | undefined): string {
  if (role && Object.prototype.hasOwnProperty.call(ROLE_TO_PATH, role)) {
    return ROLE_TO_PATH[role as AppRole];
  }
  return NO_ROLE_PATH;
}
