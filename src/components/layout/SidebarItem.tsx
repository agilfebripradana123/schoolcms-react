import { Link } from "react-router-dom";
import type { NavigationItem } from "@/types";

interface SidebarItemProps {
  item: NavigationItem;
  collapsed: boolean;
  active: boolean;
}

export default function SidebarItem({ item, collapsed, active }: SidebarItemProps) {
  return (
    <Link
      to={item.path}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-indigo-50 font-medium text-indigo-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      } ${collapsed ? "justify-center px-2" : ""}`}
      title={collapsed ? item.label : undefined}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}
