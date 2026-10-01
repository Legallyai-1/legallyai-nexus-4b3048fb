import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getActiveOrganizationId, setActiveOrganizationId } from "@/lib/organizations";

type AppRole = "owner" | "admin" | "manager" | "lawyer" | "paralegal" | "employee" | "client";

interface UserRoleData {
  role: AppRole;
  isLoading: boolean;
  redirectPath: string;
}

const roleToPath: Record<AppRole, string> = {
  owner: "/admin",
  admin: "/admin",
  manager: "/dashboard",
  lawyer: "/dashboard",
  paralegal: "/dashboard",
  employee: "/employee",
  client: "/client-portal",
};

export function useRoleBasedRedirect() {
  const navigate = useNavigate();
  const [roleData, setRoleData] = useState<UserRoleData>({
    role: "client",
    isLoading: true,
    redirectPath: "/ai-assistants",
  });

  const redirectToHub = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setRoleData(prev => ({ ...prev, isLoading: false, redirectPath: "/auth" }));
        return "/auth";
      }

      // Check user roles
      const { data: roleRecords, error: rolesError } = await supabase
        .from("user_roles")
        .select("role, organization_id")
        .eq("user_id", user.id);

      if (rolesError) throw rolesError;

      const activeOrganizationId = getActiveOrganizationId();
      const roleRecord = activeOrganizationId
        ? roleRecords?.find(({ organization_id }) => organization_id === activeOrganizationId)
        : roleRecords?.length === 1
          ? roleRecords[0]
          : null;

      if (roleRecord?.role) {
        if (!activeOrganizationId && roleRecord.organization_id) {
          setActiveOrganizationId(roleRecord.organization_id);
        }
        const path = roleToPath[roleRecord.role as AppRole] || "/ai-assistants";
        setRoleData({
          role: roleRecord.role as AppRole,
          isLoading: false,
          redirectPath: path,
        });
        return path;
      }

      // Check if user is a client
      const { data: clientRecord } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (clientRecord) {
        setRoleData({
          role: "client",
          isLoading: false,
          redirectPath: "/client-portal",
        });
        return "/client-portal";
      }

      // Check organization membership
      const { data: memberRecords, error: membershipsError } = await supabase
        .from("organization_members")
        .select("id, job_title, organization_id")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (membershipsError) throw membershipsError;

      const memberRecord = activeOrganizationId
        ? memberRecords?.find(({ organization_id }) => organization_id === activeOrganizationId)
        : memberRecords?.length === 1
          ? memberRecords[0]
          : null;

      if (memberRecord) {
        if (!activeOrganizationId) {
          setActiveOrganizationId(memberRecord.organization_id);
        }
        // Employee with org membership goes to dashboard
        setRoleData({
          role: "employee",
          isLoading: false,
          redirectPath: "/dashboard",
        });
        return "/dashboard";
      }

      // Default: new user goes to AI assistants hub
      setRoleData({
        role: "client",
        isLoading: false,
        redirectPath: "/ai-assistants",
      });
      return "/ai-assistants";

    } catch (error) {
      console.error("Error determining user role:", error);
      setRoleData(prev => ({ ...prev, isLoading: false, redirectPath: "/ai-assistants" }));
      return "/ai-assistants";
    }
  };

  return { ...roleData, redirectToHub };
}
