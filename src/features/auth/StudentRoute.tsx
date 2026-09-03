import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

/**
 * Guard portal siswa. Membedakan dua arah:
 *  - Siswa mengakses halaman admin (/student/* dan halaman admin lain) -> arahkan ke /student
 *  - Non-Siswa mengakses halaman portal siswa -> arahkan ke /dashboard
 */
export default function StudentRoute() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();

  const isStudent = role === "siswa";

  // Bungkus di sekitar halaman portal siswa: hanya Siswa boleh masuk.
  if (!isStudent) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

/**
 * Guard admin: blokir siswa akses seluruh area admin.
 * Dipakai membungkus semua route admin.
 */
export function AdminRoute() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  const isStudent = role === "siswa";

  if (isStudent) {
    return <Navigate to="/student" replace />;
  }

  return <Outlet />;
}
