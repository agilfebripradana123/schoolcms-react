import StudentSidebarItem from "./StudentSidebarItem";

interface StudentSidebarSectionProps {
  entry: { label: string; items: { path: string; label: string; icon: React.ComponentType<{ className?: string }> }[] };
  collapsed: boolean;
  expanded: boolean;
  active: boolean;
  onToggle: () => void;
  onGo: (path: string) => void;
  currentPath: string;
}

export default function StudentSidebarSection({
  entry,
  collapsed,
  expanded,
  active,
  onToggle,
  onGo,
  currentPath,
}: StudentSidebarSectionProps) {
  if (collapsed) {
    return (
      <div className="mb-1">
        {entry.items.map((item) => (
          <StudentSidebarItem
            key={item.path}
            item={item}
            collapsed={true}
            active={currentPath === item.path}
            onGo={onGo}
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
        <span>{entry.label}</span>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? "rotate-90" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {expanded && (
        <div className="ml-2 mt-2 mb-2 space-y-0.5 border-l border-white/10 pl-2">
          {entry.items.map((item) => (
            <StudentSidebarItem
              key={item.path}
              item={item}
              collapsed={false}
              active={currentPath === item.path}
              onGo={onGo}
            />
          ))}
        </div>
      )}
    </div>
  );
}