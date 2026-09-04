import { useState, useRef, useEffect, useCallback } from "react";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import NotificationBell from "@/features/notifications/NotificationBell";

interface TeacherHeaderProps {
  onToggleSidebar: () => void;
}

export default function TeacherHeader({ onToggleSidebar }: TeacherHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [imgFailed, setImgFailed] = useState(false);

  const toggleUserMenu = useCallback(() => {
    setUserMenuOpen((prev) => !prev);
  }, []);

  const closeUserMenu = useCallback(() => {
    setUserMenuOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    toast.success("Berhasil keluar", {
      description: "Sesi Anda telah diakhiri.",
    });
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeUserMenu();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeUserMenu]);

  const userDisplayName = user?.name || "Guru";

  return (
    <>
      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Keluar dari akun?"
        description="Anda akan diarahkan ke halaman login."
        confirmText="Keluar"
        cancelText="Batal"
        destructive
        onConfirm={handleLogout}
      />

      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-surface-container-lowest/90 px-4 backdrop-blur-md lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-2xl border border-slate-200 bg-white p-2 text-on-surface-variant shadow-sm transition-colors hover:border-primary-container hover:text-primary-container lg:hidden"
            aria-label="Alihkan sidebar"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-on-surface">
              Hallo, {userDisplayName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />

          <div className="relative" ref={menuRef}>
            <button
              onClick={toggleUserMenu}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 text-slate-700 shadow-sm transition-colors hover:border-primary-container hover:text-primary-container"
              aria-label="Menu pengguna"
              aria-expanded={userMenuOpen}
            >
              {user?.photo && !imgFailed ? (
                <img
                  src={user.photo as string}
                  alt={userDisplayName}
                  className="h-9 w-9 rounded-full object-cover border border-slate-200"
                  onError={() => setImgFailed(true)}
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed">
                  <span className="text-sm font-bold">
                    {userDisplayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="hidden text-sm font-semibold md:block">
                {userDisplayName}
              </span>
              <svg
                className={`hidden h-4 w-4 text-outline transition-transform md:block ${userMenuOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-surface-container-lowest p-2 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-outline">
                  Akun
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeUserMenu();
                    navigate("/guru/profile");
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low"
                >
                  <User className="h-4 w-4" /> Profil
                </button>
                <button
                  type="button"
                  onClick={() => setLogoutOpen(true)}
                  className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-error hover:bg-error-container/60"
                >
                  <LogOut className="h-4 w-4" /> Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
