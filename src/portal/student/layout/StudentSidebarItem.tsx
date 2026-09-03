interface StudentSidebarItemProps {
  item: { path: string; label: string; icon: React.ComponentType<{ className?: string }> };
  collapsed: boolean;
  active: boolean;
  onGo: (path: string) => void;
}

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
        active
          ? "bg-primary-container/20 text-white ring-1 ring-primary-fixed/30"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      } ${collapsed ? "justify-center px-2" : ""}`}
      title={collapsed ? item.label : undefined}
    >
      <item.icon
        className={`h-5 w-5 shrink-0 ${
          active ? "text-primary-fixed" : "text-slate-400"
        }`}
      />
      {!collapsed && <span>{item.label}</span>}
    </button>
  );
}
