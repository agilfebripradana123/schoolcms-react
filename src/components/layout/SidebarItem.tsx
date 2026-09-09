import { Link } from "react-router-dom";
import type { NavigationItem } from "@/types";

interface SidebarItemProps {
  item: NavigationItem;
  collapsed: boolean;
  active: boolean;
}

const activeStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--sidebar-accent) 20%, transparent)",
  color: "var(--sidebar-text)",
  border: "1px solid color-mix(in srgb, var(--sidebar-accent) 30%, transparent)",
};
const inactiveStyle: React.CSSProperties = {
  color: "var(--sidebar-text-muted)",
};
const iconActiveStyle: React.CSSProperties = { color: "var(--sidebar-accent)" };
const iconInactiveStyle: React.CSSProperties = { color: "var(--sidebar-text-muted)" };

export default function SidebarItem({ item, collapsed, active }: SidebarItemProps) {
  return (
    <Link
      to={item.path}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
        active ? "" : "hover:bg-white/5"
      } ${collapsed ? "justify-center px-2" : ""}`}
      style={active ? activeStyle : inactiveStyle}
      title={collapsed ? item.label : undefined}
    >
      <span className="flex shrink-0" style={active ? iconActiveStyle : iconInactiveStyle}>
        <item.icon className="h-4 w-4" />
      </span>
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}