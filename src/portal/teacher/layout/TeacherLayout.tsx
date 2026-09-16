import { useCallback, useEffect, useState, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import TeacherHeader from "./TeacherHeader";
import TeacherSidebar from "./TeacherSidebar";
import { useAppearance } from "@/features/system/hooks/useAppearance";
import { useAutoRefreshAuth } from "@/features/auth/hooks/useAutoRefreshAuth";

function PageLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function TeacherLayout() {
  useAutoRefreshAuth();
  const { sidebarBehavior } = useAppearance();
  const [collapsed, setCollapsed] = useState(() => sidebarBehavior === "collapse");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const toggleMobileSidebar = useCallback(() => setMobileSidebarOpen((open) => !open), []);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  useEffect(() => {
    setCollapsed(sidebarBehavior === "collapse");
  }, [sidebarBehavior]);

  // Auto-close mobile sidebar on route change (same as Student MobileSidebar)
  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname, closeMobileSidebar]);

  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar - fixed side */}
      <aside className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:flex-col overflow-hidden transition-all duration-300 ${collapsed ? "lg:w-16" : "lg:w-64"}`}>
        <TeacherSidebar collapsed={collapsed} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="fixed inset-0 bg-[var(--sidebar-bg)]/60 backdrop-blur-sm"
            onClick={closeMobileSidebar}
            aria-label="Tutup sidebar"
          />
          <div className="fixed inset-y-0 left-0 w-72 overflow-hidden bg-[var(--sidebar-bg)] shadow-2xl">
            <TeacherSidebar collapsed={collapsed} onNavigation={closeMobileSidebar} />
          </div>
        </div>
      )}

      <div className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${collapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        <TeacherHeader onToggleSidebar={toggleMobileSidebar} />
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8">
          <Suspense fallback={<PageLoadingFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
