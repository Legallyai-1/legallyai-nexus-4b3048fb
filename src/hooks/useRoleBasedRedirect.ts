import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
      const { data: roleRecord } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (roleRecord?.role) {
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
      const { data: memberRecord } = await supabase
        .from("organization_members")
        .select("id, job_title")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (memberRecord) {
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
