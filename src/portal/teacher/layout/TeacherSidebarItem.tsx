import { Link } from "react-router-dom";

interface TeacherSidebarItemProps {
  item: { path: string; label: string; icon: React.ComponentType<{ className?: string }> };
  collapsed: boolean;
  active: boolean;
}

export default function TeacherSidebarItem({
  item,
  collapsed,
  active,
}: TeacherSidebarItemProps) {
  return (
    <Link
      to={item.path}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-primary-container/20 font-semibold text-white ring-1 ring-primary-fixed/30"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      } ${collapsed ? "justify-center px-2" : ""}`}
      title={collapsed ? item.label : undefined}
    >
      <item.icon
        className={`h-4 w-4 shrink-0 ${
          active ? "text-primary-fixed" : "text-slate-400"
        }`}
      />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}
