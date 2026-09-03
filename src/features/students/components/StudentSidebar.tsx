import { useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { studentNavigation } from "@/config/navigation";
import { useAuth } from "@/features/auth/useAuth";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";

export default function StudentSidebar({ collapsed = false }: { collapsed?: boolean }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const activeGroup = studentNavigation.find(
      (g) => "items" in g && g.items?.some((i) => pathname.startsWith(i.path)),
    );
    return new Set(activeGroup && "label" in activeGroup ? [activeGroup.label] : []);
  });
  const [logoutOpen, setLogoutOpen] = useState(false);

  const toggleSection = useCallback((label: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    setLogoutOpen(false);
    logout();
    toast.success("Berhasil keluar", { description: "Sesi Anda telah diakhiri." });
    navigate("/login", { replace: true });
  };

  return (
    <nav className="flex h-full flex-col bg-slate-950 text-white">
      <div
        className={`flex h-16 items-center border-b border-white/10 px-4 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-container text-white shadow-lg shadow-primary-container/30">
            <span className="text-base font-bold">S</span>
          </div>
          {!collapsed && (
            <div>
              <div className="font-display text-base font-bold leading-none">SchoolCMS</div>
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Portal Siswa</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {studentNavigation.map((entry) => {
            if ("items" in entry) {
              const expanded = expandedSections.has(entry.label);
              return (
                <div key={entry.label} className="mb-1">
                  <button
                    onClick={() => toggleSection(entry.label)}
                    className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-semibold transition-colors ${
                      expanded
                        ? "bg-primary-container/15 text-white"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                    aria-expanded={expanded}
                  >
                    <span>{entry.label}</span>
                    <svg
                      className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? "rotate-90" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {expanded && (
                    <div className="ml-2 mt-2 mb-2 space-y-0.5 border-l border-white/10 pl-2">
                      {entry.items?.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                            isActive(item.path)
                              ? "bg-primary-container/20 font-semibold text-white ring-1 ring-primary-fixed/30"
                              : "text-slate-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <item.icon
                            className={`h-4 w-4 shrink-0 ${isActive(item.path) ? "text-primary-fixed" : "text-slate-400"}`}
                          />
                          {!collapsed && <span>{item.label}</span>}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={entry.path}
                to={entry.path}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive(entry.path)
                    ? "bg-primary-container/20 text-white ring-1 ring-primary-fixed/30"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <entry.icon
                  className={`h-5 w-5 shrink-0 ${isActive(entry.path) ? "text-primary-fixed" : "text-slate-400"}`}
                />
                {!collapsed && <span>{entry.label}</span>}
              </Link>
            );
          })}

          <button
            onClick={() => setLogoutOpen(true)}
            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-rose-400 transition-colors hover:bg-rose-500/10 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </div>

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
    </nav>
  );
}
