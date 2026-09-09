import { useEffect, useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import { navigation, dashboardItem } from "@/config/navigation";
import SidebarSection from "./SidebarSection";
import { usePublicSettings } from "@/features/system/hooks/usePublicSettings";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const { appName, faviconUrl } = usePublicSettings();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const activeGroup = navigation.find((group) =>
      group.items.some((item) => location.pathname === item.path || location.pathname.startsWith(item.path + "/")),
    );
    return new Set(activeGroup ? [activeGroup.label] : []);
  });

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const toggleSection = useCallback((label: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (group: (typeof navigation)[number]) =>
    group.items.some((item) => location.pathname === item.path);

  const handleBackdropClick = useCallback(() => onClose(), [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={handleBackdropClick} />

      <div className="fixed inset-y-0 left-0 w-72 overflow-hidden shadow-2xl" style={{ backgroundColor: "var(--sidebar-bg)" }}>
        <nav className="flex h-full flex-col" style={{ color: "var(--sidebar-text)" }}>
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
            <div className="flex items-center gap-3">
              {faviconUrl ? (
                <img src={faviconUrl} alt={appName ?? "SchoolCMS"} className="h-9 w-9 rounded-2xl object-cover" style={{ boxShadow: "0 4px 12px color-mix(in srgb, var(--sidebar-accent) 30%, transparent)" }} />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: "var(--sidebar-accent)", boxShadow: "0 4px 12px color-mix(in srgb, var(--sidebar-accent) 30%, transparent)" }}>
                  <span className="text-sm font-bold">S</span>
                </div>
              )}
              <div>
                <div className="font-display text-base font-bold leading-none">{appName}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em]" style={{ color: "var(--sidebar-text-muted)" }}>Administrator</div>
              </div>
            </div>
            <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 p-2" style={{ color: "var(--sidebar-text-muted)" }} aria-label="Tutup sidebar">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="mb-2">
              <a
                href={dashboardItem.path}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${isActive(dashboardItem.path) ? "" : "hover:bg-white/5"}`}
                style={isActive(dashboardItem.path) ? { backgroundColor: "color-mix(in srgb, var(--sidebar-accent) 20%, transparent)", color: "var(--sidebar-text)", border: "1px solid color-mix(in srgb, var(--sidebar-accent) 20%, transparent)" } : { color: "var(--sidebar-text-muted)" }}
              >
                <dashboardItem.icon className="h-5 w-5 shrink-0" style={{ color: isActive(dashboardItem.path) ? "var(--sidebar-accent)" : "var(--sidebar-text-muted)" }} />
                <span>{dashboardItem.label}</span>
              </a>
            </div>

            <div className="mt-4 space-y-1">
              {navigation.map((group) => (
                <SidebarSection
                  key={group.label}
                  group={group}
                  collapsed={false}
                  expanded={expandedSections.has(group.label)}
                  active={isGroupActive(group)}
                  onToggle={() => toggleSection(group.label)}
                  currentPath={location.pathname}
                />
              ))}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
