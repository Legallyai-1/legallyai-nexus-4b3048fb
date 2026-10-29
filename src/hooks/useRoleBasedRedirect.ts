import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getActiveOrganizationId, setActiveOrganizationId } from "@/lib/organizations";
import { NO_ROLE_PATH, pathForRole, type AppRole } from "@/lib/postLoginPath";

interface UserRoleData {
  role: AppRole;
  isLoading: boolean;
  redirectPath: string;
}

export function useRoleBasedRedirect() {
  const [roleData, setRoleData] = useState<UserRoleData>({
    role: "client", isLoading: true, redirectPath: NO_ROLE_PATH,
  });
  const redirectToHub = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRoleData(prev => ({ ...prev, isLoading: false, redirectPath: "/auth" }));
        return "/auth";
      }
      const { data: roleRecords, error: rolesError } = await supabase
        .from("user_roles").select("role, organization_id").eq("user_id", user.id);
      if (rolesError) throw rolesError;
      const activeOrganizationId = getActiveOrganizationId();
      const roleRecord = activeOrganizationId
        ? roleRecords?.find(({ organization_id }) => organization_id === activeOrganizationId)
        : roleRecords?.length === 1 ? roleRecords[0] : null;
      if (roleRecord?.role) {
        if (!activeOrganizationId && roleRecord.organization_id) {
          setActiveOrganizationId(roleRecord.organization_id);
        }
        const path = pathForRole(roleRecord.role);
        setRoleData({ role: roleRecord.role as AppRole, isLoading: false, redirectPath: path });
        return path;
      }
      const { data: clientRecord } = await supabase
        .from("clients").select("id").eq("user_id", user.id).maybeSingle();
      if (clientRecord) {
        setRoleData({ role: "client", isLoading: false, redirectPath: "/client-portal" });
        return "/client-portal";
      }
      const { data: memberRecords, error: membershipsError } = await supabase
        .from("organization_members").select("id, job_title, organization_id")
        .eq("user_id", user.id).eq("is_active", true);
      if (membershipsError) throw membershipsError;
      const memberRecord = activeOrganizationId
        ? memberRecords?.find(({ organization_id }) => organization_id === activeOrganizationId)
        : memberRecords?.length === 1 ? memberRecords[0] : null;
      if (memberRecord) {
        if (!activeOrganizationId) setActiveOrganizationId(memberRecord.organization_id);
        setRoleData({ role: "employee", isLoading: false, redirectPath: "/dashboard" });
        return "/dashboard";
      }
      setRoleData({ role: "client", isLoading: false, redirectPath: NO_ROLE_PATH });
      return NO_ROLE_PATH;
    } catch (error) {
      console.error("Error determining user role:", error);
      setRoleData(prev => ({ ...prev, isLoading: false, redirectPath: NO_ROLE_PATH }));
      return NO_ROLE_PATH;
    }
  }, []);
  return { ...roleData, redirectToHub };
}
