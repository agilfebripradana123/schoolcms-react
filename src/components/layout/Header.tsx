import { useState, useRef, useEffect, useCallback } from "react";
import { LogOut, User, Settings } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleUserMenu = useCallback(() => {
    setUserMenuOpen((prev) => !prev);
  }, []);

  const closeUserMenu = useCallback(() => {
    setUserMenuOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
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

  const userDisplayName = user?.name || "User";

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
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
      </div>

      <div className="flex items-center gap-2">
        <div className="relative" ref={menuRef}>
          <button
            onClick={toggleUserMenu}
            className="flex items-center gap-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Menu pengguna"
            aria-expanded={userMenuOpen}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
              <span className="text-sm font-medium text-indigo-700">
                {userDisplayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="hidden text-sm font-medium text-slate-700 md:block">
              {userDisplayName}
            </span>
            <svg
              className={`hidden h-4 w-4 text-slate-400 transition-transform md:block ${
                userMenuOpen ? "rotate-180" : ""
              }`}
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
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <a
                href="#profile"
                onClick={closeUserMenu}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <User className="h-4 w-4" />
                Profil
              </a>
              <a
                href="#settings"
                onClick={closeUserMenu}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Settings className="h-4 w-4" />
                Pengaturan
              </a>
              <hr className="my-1 border-slate-100" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}