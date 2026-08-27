import { useEffect, useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import { navigation, dashboardItem } from "@/config/navigation";
import SidebarSection from "./SidebarSection";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const activeGroup = navigation.find((group) =>
      group.items.some((item) => location.pathname.startsWith(item.path)),
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
    group.items.some((item) => location.pathname === item.path || location.pathname.startsWith(item.path + "/"));

  const handleBackdropClick = useCallback(() => onClose(), [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={handleBackdropClick} />

      <div className="fixed inset-y-0 left-0 w-72 overflow-hidden bg-slate-950 shadow-2xl">
        <nav className="flex h-full flex-col text-white">
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-container text-white shadow-lg shadow-primary-container/30">
                <span className="text-sm font-bold">S</span>
              </div>
              <div>
                <div className="font-display text-base font-bold leading-none">SchoolCMS</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Premium EdTech</div>
              </div>
            </div>
            <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-300" aria-label="Tutup sidebar">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="mb-2">
              <a
                href={dashboardItem.path}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${isActive(dashboardItem.path) ? "bg-primary-container/20 text-white ring-1 ring-primary-fixed/20" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
              >
                <dashboardItem.icon className={`h-5 w-5 shrink-0 ${isActive(dashboardItem.path) ? "text-primary-fixed" : "text-slate-400"}`} />
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
