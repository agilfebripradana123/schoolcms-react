import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { navigation, dashboardItem } from "@/config/navigation";
import SidebarSection from "./SidebarSection";
import { useState } from "react";

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
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (group: (typeof navigation)[number]) =>
    group.items.some(
      (item) =>
        location.pathname === item.path ||
        location.pathname.startsWith(item.path + "/"),
    );

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleBackdropClick}
      />

      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl transition-transform">
        <nav className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <span className="text-sm font-bold text-white">S</span>
              </div>
              <span className="text-lg font-bold text-slate-900">SchoolCMS</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close sidebar"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="mb-2">
              <a
                href={dashboardItem.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(dashboardItem.path)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <dashboardItem.icon className="h-5 w-5 shrink-0" />
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
