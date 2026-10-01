import { supabase } from "@/integrations/supabase/client";

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
  const { data: orgMember, error: memberError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (memberError) {
    throw memberError;
  }

  if (orgMember) {
    return orgMember.organization_id;
  }

  const { data: organization, error: createError } = await supabase.rpc("create_organization_atomic", {
    p_name: "My Law Practice",
    p_slug: buildOrganizationSlug("My Law Practice", userId),
  });

  if (createError) {
    throw createError;
  }

  if (!organization?.id) {
    throw new Error("Organization creation did not return an organization id");
  }

  return organization.id;
};
