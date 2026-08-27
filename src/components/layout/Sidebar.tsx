import { navigation } from "../../app/config/navigation";
import { SidebarItem } from "./SidebarItem";

type SidebarProps = {
  onNavigate?: () => void;
};

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <nav className="flex h-full flex-col overflow-y-auto px-3 py-4">
      <div className="mb-6 flex items-center gap-2 px-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <span className="text-sm font-bold text-white">S</span>
        </div>
        <span className="text-lg font-semibold text-white">SchoolCMS</span>
      </div>

      <div className="flex-1 space-y-1">
        {navigation.map((group, groupIndex) => (
          <div key={groupIndex}>
            {group.title && (
              <p className="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {group.title}
              </p>
            )}
            {group.items.map((item) => (
              <SidebarItem
                key={item.path}
                item={item}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}
