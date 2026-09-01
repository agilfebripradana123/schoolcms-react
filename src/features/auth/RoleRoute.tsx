import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

interface RoleRouteProps {
  allow?: string[]; // daftar role yang diizinkan
}

/**
 * Guard berbasis role. Jika user tidak memiliki role yang diizinkan,
 * arahkan ke dashboard. Digunakan misal untuk membatasi modul PPDB
 * ke role Admin/Administrator saja (Guru diblokir, dst).
 */
export default function RoleRoute({ allow }: RoleRouteProps) {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();

  if (allow && role && !allow.map((r) => r.toLowerCase()).includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
