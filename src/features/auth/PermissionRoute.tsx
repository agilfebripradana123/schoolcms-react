import { Outlet } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { usePermission } from "./usePermission";

interface PermissionRouteProps {
  permission: string;
}

/**
 * Reusable permission-based route guard.
 *
 * Renders the nested routes (Outlet) only when the authenticated user holds the
 * given (effective) permission; otherwise renders a 403-style unauthorized
 * message. Navigation hiding alone is not security — this guard provides the
 * frontend UX layer, while the backend remains the real security boundary.
 */
export default function PermissionRoute({ permission }: PermissionRouteProps) {
  const { can } = usePermission();

  if (!can(permission)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error-container/60">
            <ShieldAlert className="h-8 w-8 text-error" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-on-surface">
            Akses Tidak Diizinkan
          </h2>
          <p className="mt-1 max-w-sm text-sm text-on-surface-variant">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
