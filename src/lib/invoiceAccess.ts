// LEG-25: the invoice generator decides which time entries are unbilled by reading the org's
// invoices. If the user can't read all of those invoices, RLS silently returns fewer (or zero)
// rows and already-billed entries would look unbilled, which leads to double billing. So the
// generator is only offered to roles that can read every org invoice.
//
// This mirrors the invoices SELECT policy in migration 20251210162025:
//   has_role(owner|admin|manager, organization_id) OR the invoice's case is assigned to the user.
// The assigned-lawyer branch only exposes invoices whose case_id is one of the user's cases.
// Invoices from this generator have no case_id, so that branch can't show a lawyer what was
// already billed. Assigned lawyers (and every other role) therefore get read-only access here.

export const INVOICE_READ_ROLES = ["owner", "admin", "manager"] as const;

export interface RoleRow {
  role: string | null;
  organization_id: string | null;
}

/** True only if the user holds owner/admin/manager in this organization (same as has_role(..., org)). */
export function canReadOrgInvoices(roles: RoleRow[] | null | undefined, organizationId: string | null | undefined): boolean {
  if (!organizationId) return false;
  return (roles ?? []).some(
    (r) => r.organization_id === organizationId && (INVOICE_READ_ROLES as readonly string[]).includes(r.role ?? ""),
  );
}
