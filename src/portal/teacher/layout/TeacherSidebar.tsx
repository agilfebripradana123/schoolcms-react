import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { teacherNavigation, teacherDashboardItem } from "@/config/navigation";
import { usePermission } from "@/features/auth/usePermission";
import TeacherSidebarSection from "./TeacherSidebarSection";
import TeacherSidebarItem from "./TeacherSidebarItem";
import { usePublicSettings } from "@/features/system/hooks/usePublicSettings";

export default function TeacherSidebar({
  collapsed = false,
  onNavigation,
}: {
  collapsed?: boolean;
  onNavigation?: () => void;
}) {
  const { appName, faviconUrl } = usePublicSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const { can } = usePermission();

  // Filter sections by effective permission (menu-level visibility ONLY;
  // the backend remains the security boundary).
  const visibleNavigation = teacherNavigation.filter(
    (section) => !("permission" in section) || can(section.permission as string | undefined),
  );

  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const activeGroup = teacherNavigation.find((g) =>
      "items" in g && g.items?.some((i) => pathname.startsWith(i.path)),
    );
    return new Set(activeGroup && "label" in activeGroup ? [activeGroup.label] : []);
  });

  const toggleSection = useCallback((label: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  const goTo = useCallback(
    (path: string) => {
      onNavigation?.();
      navigate(path, { replace: true });
    },
    [navigate, onNavigation],
  );

  const isActive = useCallback((path: string) => pathname === path, [pathname]);
  const isGroupActive = useCallback(
    (entry: (typeof visibleNavigation)[number]) =>
      "items" in entry &&
      entry.items?.some((i) => pathname === i.path),
    [pathname],
  );

  return (
    <nav className="flex h-full flex-col" style={{ backgroundColor: "var(--sidebar-bg)", color: "var(--sidebar-text)" }}>
      <div
        className={`flex h-16 items-center border-b border-white/10 px-4 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          {faviconUrl ? (
            <img src={faviconUrl} alt={appName ?? "SchoolCMS"} className="h-10 w-10 rounded-2xl object-cover shadow-lg shadow-primary-container/30" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-container text-white shadow-lg shadow-primary-container/30">
              <span className="text-base font-bold">G</span>
            </div>
          )}
          {!collapsed && (
            <div>
              <div className="font-display text-base font-bold leading-none">{appName}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.2em]" style={{ color: "var(--sidebar-text-muted)" }}>Portal Guru</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2">
          <button
            onClick={() => goTo(teacherDashboardItem.path)}
            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              isActive(teacherDashboardItem.path)
                ? ""
                : "hover:bg-white/5"
            } ${collapsed ? "justify-center" : ""}`}
            style={isActive(teacherDashboardItem.path)
              ? { backgroundColor: "color-mix(in srgb, var(--sidebar-accent) 20%, transparent)", color: "var(--sidebar-text)", border: "1px solid color-mix(in srgb, var(--sidebar-accent) 30%, transparent)" }
              : { color: "var(--sidebar-text-muted)" }}
          >
            <teacherDashboardItem.icon
              className="h-5 w-5 shrink-0"
              style={{ color: isActive(teacherDashboardItem.path) ? "var(--sidebar-accent)" : "var(--sidebar-text-muted)" }}
            />
            {!collapsed && <span>{teacherDashboardItem.label}</span>}
          </button>
        </div>

        <div className="mt-4 space-y-1">
          {visibleNavigation.map((entry) => {
            if ("items" in entry) {
              return (
                <TeacherSidebarSection
                  key={entry.label}
                  entry={entry}
                  collapsed={collapsed}
                  expanded={expandedSections.has(entry.label)}
                  active={isGroupActive(entry)}
                  can={can}
                  onToggle={() => toggleSection(entry.label)}
                  onGo={goTo}
                  currentPath={pathname}
                />
              );
            }
            const solo = entry as unknown as { path: string; label: string; icon: React.ComponentType<{ className?: string }> };
            return (
              <TeacherSidebarItem
                key={solo.path}
                item={solo}
                collapsed={collapsed}
                active={isActive(solo.path)}
                onGo={goTo}
              />
            );
          })}
        </div>
      </div>
    </nav>
  );
}
