import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileSidebar from "./MobileSidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />

      <MobileSidebar open={sidebarOpen} onClose={closeMobileSidebar} />

      <div
        className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        <Header onToggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
