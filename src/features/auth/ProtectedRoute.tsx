import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import { getLoginRedirectPath } from "./context";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-container-low">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Use role-aware redirect so a logged-out admin lands on /login/admin,
    // guru on /login/guru, and siswa on /login — not always /login.
    const target = getLoginRedirectPath(user);
    return <Navigate to={target} replace state={{ from: location }} />;
  }

  return <Outlet />;
}