import { useState, useCallback, Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import StudentHeader from "@/portal/student/layout/StudentHeader";
import StudentSidebar from "@/portal/student/layout/StudentSidebar";

function PageLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function GuruLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = useCallback(() => setMobileSidebarOpen((p) => !p), []);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:flex-col lg:w-64 overflow-hidden bg-slate-950">
        <StudentSidebar collapsed={false} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={closeMobileSidebar} />
          <div className="fixed inset-y-0 left-0 w-72 bg-slate-950 shadow-2xl">
            <StudentSidebar collapsed={false} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col">
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
