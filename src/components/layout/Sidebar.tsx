import { useState, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { navigation, dashboardItem } from "@/config/navigation";
import SidebarSection from "./SidebarSection";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;

  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const activeGroup = navigation.find((group) =>
      group.items.some((item) => pathname.startsWith(item.path)),
    );
    return new Set(activeGroup ? [activeGroup.label] : []);
  });

  const toggleSection = useCallback((label: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  }, []);

  const isActive = useCallback((path: string) => pathname === path, [pathname]);
  const isGroupActive = useCallback(
    (group: (typeof navigation)[number]) =>
      group.items.some((item) => pathname === item.path || pathname.startsWith(item.path + "/")),
    [pathname],
  );

  const sidebarContent = useMemo(
    () => (
      <nav className="flex h-full flex-col bg-slate-950 text-white">
        <div
          className={`flex h-16 items-center border-b border-white/10 px-4 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-container text-white shadow-lg shadow-primary-container/30">
              <span className="text-base font-bold">A</span>
            </div>
            {!collapsed && (
              <div>
                <div className="font-display text-base font-bold leading-none">Akademi Bintang</div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">SchoolCMS</div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2">
            <a
              href={dashboardItem.path}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive(dashboardItem.path)
                  ? "bg-primary-container/20 text-white ring-1 ring-primary-fixed/30"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? dashboardItem.label : undefined}
            >
              <dashboardItem.icon
                className={`h-5 w-5 shrink-0 ${
                  isActive(dashboardItem.path) ? "text-primary-fixed" : "text-slate-400"
                }`}
              />
              {!collapsed && <span>{dashboardItem.label}</span>}
            </a>
          </div>

          <div className="mt-4 space-y-1">
            {navigation.map((group) => (
              <SidebarSection
                key={group.label}
                group={group}
                collapsed={collapsed}
                expanded={expandedSections.has(group.label)}
                active={isGroupActive(group)}
                onToggle={() => toggleSection(group.label)}
                currentPath={pathname}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={onToggleCollapse}
            className="hidden w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white lg:flex"
            aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          >
            <svg
              className={`h-5 w-5 transition-transform ${collapsed ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </nav>
    ),
    [collapsed, expandedSections, pathname, onToggleCollapse, isActive, isGroupActive, toggleSection],
  );

  return (
    <aside
      className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:flex-col overflow-hidden transition-all duration-300 ${
        collapsed ? "lg:w-16" : "lg:w-64"
      }`}
    >
      {sidebarContent}
    </aside>
  );
}
