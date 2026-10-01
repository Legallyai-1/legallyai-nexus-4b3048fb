import { useEffect, useState } from "react";
import { getActiveOrganizationId, setActiveOrganizationId } from "@/lib/organizations";
import { supabase } from "@/integrations/supabase/client";

interface OrganizationOption {
  id: string;
  name: string;
}

interface ActiveOrganizationSwitcherProps {
  className?: string;
  containerClassName?: string;
}

export function ActiveOrganizationSwitcher({
  className,
  containerClassName,
}: ActiveOrganizationSwitcherProps) {
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [activeOrganizationId, setSelectedOrganizationId] = useState("");

  useEffect(() => {
    let active = true;

    const loadOrganizations = async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name")
        .order("name");

      if (!active || error) return;

      const availableOrganizations = data ?? [];
      const storedOrganizationId = getActiveOrganizationId();
      const storedOrganizationIsAvailable = availableOrganizations.some(
        ({ id }) => id === storedOrganizationId,
      );
      const selectedOrganizationId = storedOrganizationIsAvailable
        ? storedOrganizationId!
        : availableOrganizations.length === 1
          ? availableOrganizations[0].id
          : "";

      if (!storedOrganizationIsAvailable && storedOrganizationId) {
        setActiveOrganizationId(null);
      }
      if (selectedOrganizationId && selectedOrganizationId !== storedOrganizationId) {
        setActiveOrganizationId(selectedOrganizationId);
        if (storedOrganizationId) {
          window.location.reload();
          return;
        }
      }

      setOrganizations(availableOrganizations);
      setSelectedOrganizationId(selectedOrganizationId);
    };

    void loadOrganizations().catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  if (organizations.length < 2) return null;

  return (
    <div className={containerClassName}>
      <label className={className}>
        <span className="sr-only">Active organization</span>
        <select
          aria-label="Active organization"
          className="h-9 max-w-56 rounded-md border border-border bg-background px-2 text-sm text-foreground"
          value={activeOrganizationId}
          onChange={(event) => {
            const organizationId = event.target.value || null;
            setActiveOrganizationId(organizationId);
            setSelectedOrganizationId(organizationId ?? "");
            window.location.reload();
          }}
        >
          {!activeOrganizationId && <option value="">Choose organization</option>}
          {organizations.map(({ id, name }) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
