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
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }, []);

  const isActive = useCallback(
    (path: string) => pathname === path,
    [pathname],
  );

  const isGroupActive = useCallback(
    (group: (typeof navigation)[number]) =>
      group.items.some(
        (item) =>
          pathname === item.path || pathname.startsWith(item.path + "/"),
      ),
    [pathname],
  );

  const sidebarContent = useMemo(
    () => (
      <nav className="flex h-full flex-col">
        <div
          className={`flex h-16 items-center border-b border-slate-200 px-4 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-slate-900">SchoolCMS</span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2">
            <a
              href={dashboardItem.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(dashboardItem.path)
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-700 hover:bg-slate-100"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? dashboardItem.label : undefined}
            >
              <dashboardItem.icon className="h-5 w-5 shrink-0" />
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

        <div className="border-t border-slate-200 p-3">
          <button
            onClick={onToggleCollapse}
            className="hidden w-full items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:flex"
            aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          >
            <svg
              className={`h-5 w-5 transition-transform ${collapsed ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </nav>
    ),
    [
      collapsed,
      expandedSections,
      pathname,
      onToggleCollapse,
      isActive,
      isGroupActive,
      toggleSection,
    ],
  );

  return (
    <aside
      className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:flex-col bg-white border-r border-slate-200 transition-all duration-300 ${
        collapsed ? "lg:w-16" : "lg:w-64"
      }`}
    >
      {sidebarContent}
    </aside>
  );
}
