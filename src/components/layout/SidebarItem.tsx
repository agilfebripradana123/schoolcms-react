import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import type { NavigationItem } from "../../types/navigation";

type SidebarItemProps = {
  item: NavigationItem;
  depth?: number;
  onNavigate?: () => void;
};

export function SidebarItem({ item, depth = 0, onNavigate }: SidebarItemProps) {
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;
  const [expanded, setExpanded] = useState(() => {
    if (!hasChildren) return false;
    return item.children!.some((child) =>
      location.pathname.startsWith(child.path)
    );
  });

  const Icon = item.icon;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
            ${
              depth > 0 ? "pl-10" : ""
            }
            text-slate-300 hover:bg-slate-800 hover:text-white`}
        >
          {Icon && <Icon className="h-5 w-5 shrink-0" />}
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
        {expanded && (
          <div className="mt-1">
            {item.children!.map((child) => (
              <SidebarItem
                key={child.path}
                item={child}
                depth={depth + 1}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          depth > 0 ? "pl-10" : ""
        } ${
          isActive
            ? "bg-indigo-600 text-white"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" />}
      <span>{item.label}</span>
    </NavLink>
  );
}
