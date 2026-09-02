import { useState, useRef, useEffect, useCallback } from "react";
import { LogOut, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { toast } from "sonner";

interface StudentHeaderProps {
  onToggleSidebar: () => void;
}

export default function StudentHeader({ onToggleSidebar }: StudentHeaderProps) {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = useCallback(() => {
    logout();
    toast.success("Berhasil keluar", {
      description: "Sesi Anda telah diakhiri.",
    });
    window.location.href = "/login";
  }, [logout]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userDisplayName = user?.name || "Siswa";

  return (
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden lg:block">
          <p className="text-sm font-semibold text-on-surface">
            Hallo, {userDisplayName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to="/siswa/notifications"
          className="rounded-2xl border border-slate-200 bg-white p-2 text-on-surface-variant shadow-sm transition-colors hover:border-primary-container hover:text-primary-container"
          aria-label="Notifikasi"
        >
          <Bell className="h-5 w-5" />
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen((p) => !p)}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 text-slate-700 shadow-sm transition-colors hover:border-primary-container hover:text-primary-container"
            aria-label="Menu pengguna"
            aria-expanded={userMenuOpen}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed">
              <span className="text-sm font-bold">
                {userDisplayName.charAt(0).toUpperCase()}
              </span>
            </div>
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-surface-container-lowest p-2 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-outline">
                Akun
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-error hover:bg-error-container/60"
              >
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
