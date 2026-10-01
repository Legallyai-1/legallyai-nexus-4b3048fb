import { supabase } from "@/integrations/supabase/client";

const ACTIVE_ORGANIZATION_STORAGE_KEY = "legallyai_active_organization_id";

export const getActiveOrganizationId = () =>
  typeof window === "undefined"
    ? null
    : window.localStorage.getItem(ACTIVE_ORGANIZATION_STORAGE_KEY);

export const setActiveOrganizationId = (organizationId: string | null) => {
  if (typeof window === "undefined") return;
  if (organizationId) {
    window.localStorage.setItem(ACTIVE_ORGANIZATION_STORAGE_KEY, organizationId);
  } else {
    window.localStorage.removeItem(ACTIVE_ORGANIZATION_STORAGE_KEY);
  }
};

const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const buildOrganizationSlug = (name: string, uniqueSuffix: string) => {
  const base = normalizeSlug(name);
  const suffix = normalizeSlug(uniqueSuffix).slice(0, 8) || "org";
  return `${base || "org"}-${suffix}`;
};

export const ensureUserOrganization = async (userId: string) => {
  const { data: orgMembers, error: memberError } = await supabase
    .from("organization_members")
    .select("organization_id, is_active")
    .eq("user_id", userId);

  if (memberError) {
    throw memberError;
  }

  const activeMembers = (orgMembers ?? []).filter(({ is_active }) => is_active === true);
  const activeOrganizationId = getActiveOrganizationId();
  if (activeOrganizationId && activeMembers.some(({ organization_id }) => organization_id === activeOrganizationId)) {
    return activeOrganizationId;
  }

  if (activeMembers.length === 1) {
    const organizationId = activeMembers[0].organization_id;
    setActiveOrganizationId(organizationId);
    return organizationId;
  }

  if (activeMembers.length > 1) {
    throw new Error("Choose an organization from the organization menu before continuing");
  }

  if (orgMembers?.length) {
    throw new Error("You do not have an active organization membership");
  }

  const { data: organization, error: createError } = await supabase.rpc("create_organization_atomic", {
    p_name: "My Law Practice",
    p_slug: buildOrganizationSlug("My Law Practice", userId),
  });

  if (createError) {
    if (createError.code === "23505") {
      const { data: retryMembers, error: retryError } = await supabase
        .from("organization_members")
        .select("organization_id, is_active")
        .eq("user_id", userId);

      if (retryError) {
        throw retryError;
      }

      const retryActiveMembers = (retryMembers ?? []).filter(({ is_active }) => is_active === true);
      if (retryActiveMembers.length === 1) {
        const organizationId = retryActiveMembers[0].organization_id;
        setActiveOrganizationId(organizationId);
        return organizationId;
      }

      if (retryActiveMembers.length > 1) {
        throw new Error("Choose an organization from the organization menu before continuing");
      }
    }

    throw createError;
  }

  if (!organization?.id) {
    throw new Error("Organization creation did not return an organization id");
  }

  setActiveOrganizationId(organization.id);
  return organization.id;
};
