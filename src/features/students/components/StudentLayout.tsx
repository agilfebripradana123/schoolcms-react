import { useCallback, useEffect, useState, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import StudentHeader from "./StudentHeader";
import StudentSidebar from "./StudentSidebar";

function PageLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function StudentLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const toggleMobileSidebar = useCallback(() => setMobileSidebarOpen((open) => !open), []);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  // Auto-close mobile sidebar on route change (same as Admin MobileSidebar)
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
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:flex-col overflow-hidden transition-all duration-300 lg:w-64">
        <StudentSidebar collapsed={false} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeMobileSidebar}
            aria-label="Tutup sidebar"
          />
          <div className="fixed inset-y-0 left-0 w-72 overflow-hidden bg-slate-950 shadow-2xl">
            <StudentSidebar collapsed={false} onNavigation={closeMobileSidebar} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
        <StudentHeader onToggleSidebar={toggleMobileSidebar} />
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8">
          <Suspense fallback={<PageLoadingFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}