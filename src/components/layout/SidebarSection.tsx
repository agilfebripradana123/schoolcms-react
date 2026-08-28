import SidebarItem from "./SidebarItem";
import type { NavigationGroup } from "@/types";

interface SidebarSectionProps {
  group: NavigationGroup;
  collapsed: boolean;
  expanded: boolean;
  active: boolean;
  onToggle: () => void;
  currentPath: string;
}

export default function SidebarSection({
  group,
  collapsed,
  expanded,
  active,
  onToggle,
  currentPath,
}: SidebarSectionProps) {
  if (collapsed) {
    return (
      <div className="mb-1">
        {group.items.map((item) => (
          <SidebarItem
            key={item.path}
            item={item}
            collapsed={collapsed}
            active={currentPath === item.path}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-semibold transition-colors ${
          active
            ? "bg-primary-container/15 text-white"
            : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`}
        aria-expanded={expanded}
      >
        <span>{group.label}</span>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {expanded && (
        <div className="ml-2 mt-2 mb-2 space-y-0.5 border-l border-white/10 pl-2">
          {group.items.map((item) => (
            <SidebarItem
              key={item.path}
              item={item}
              collapsed={false}
              active={currentPath === item.path}
            />
          ))}
        </div>
      )}
    </div>
  );
}
