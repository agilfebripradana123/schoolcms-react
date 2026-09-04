import { useCallback } from "react";
import { useAuth } from "./useAuth";

/**
 * Reusable permission-checking hook (authorization concern, portal-agnostic).
 *
 * Reads the authenticated user's effective permissions, which the backend
 * resolves as:
 *
 *   role permissions (permission_role) UNION user additional permissions (permission_user)
 *
 * Usable by Admin, Guru, and any other portal.
 *
 *   const { can } = usePermission();
 *   can("manage-facilities")
 */
export function usePermission() {
  const { user } = useAuth();

  const can = useCallback(
    (permission?: string) => {
      if (!permission) return true;
      const normalized = permission.toLowerCase();
      return (user?.permissions ?? []).some((p) => p.toLowerCase() === normalized);
    },
    [user],
  );

  const canAny = useCallback(
    (required: string[]) => required.some((p) => can(p)),
    [can],
  );

  const canAll = useCallback(
    (required: string[]) => required.every((p) => can(p)),
    [can],
  );

  return { can, canAny, canAll, permissions: user?.permissions ?? [] };
}
