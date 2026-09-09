interface StudentSidebarItemProps {
  item: { path: string; label: string; icon?: React.ComponentType<{ className?: string }> };
  collapsed: boolean;
  active: boolean;
  onGo: (path: string) => void;
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

export default function StudentSidebarItem({
  item,
  collapsed,
  active,
  onGo,
}: StudentSidebarItemProps) {
  return (
    <button
      onClick={() => onGo(item.path)}
      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
        active ? "" : "hover:bg-white/5 hover:text-white"
      } ${collapsed ? "justify-center px-2" : ""}`}
      style={active ? activeStyle : inactiveStyle}
      title={collapsed ? item.label : undefined}
    >
      {item.icon ? (
        <span className="flex shrink-0" style={active ? iconActiveStyle : iconInactiveStyle}>
          <item.icon className="h-5 w-5" />
        </span>
      ) : (
        <span
          className="h-5 w-5 shrink-0 rounded-md"
          style={{ backgroundColor: active ? "color-mix(in srgb, var(--sidebar-accent) 30%, transparent)" : "rgba(100,116,139,0.4)" }}
        />
      )}
      {!collapsed && <span>{item.label}</span>}
    </button>
  );
}