import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

/**
 * Guard portal guru (/guru). Hanya role Guru yang diizinkan.
 * Non-Guru (Siswa, Admin) diarahkan ke tempat semestinya.
 */
export default function GuruRoute() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  const isGuru = role === "guru";

  if (!isGuru) {
    return <Navigate to={role === "siswa" ? "/siswa" : "/admin"} replace />;
  }

  return <Outlet />;
}
