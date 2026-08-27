import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { navigation } from "@/config/navigation";

interface BreadcrumbSegment {
  label: string;
  path: string;
  isLast: boolean;
}

export default function Breadcrumb() {
  const location = useLocation();

  const segments = useMemo((): BreadcrumbSegment[] => {
    if (location.pathname === "/dashboard" || location.pathname === "/") {
      return [{ label: "Dashboard", path: "/dashboard", isLast: true }];
    }

    const result: BreadcrumbSegment[] = [
      { label: "Dashboard", path: "/dashboard", isLast: false },
    ];

    for (const group of navigation) {
      for (const item of group.items) {
        if (
          location.pathname === item.path ||
          location.pathname.startsWith(item.path + "/")
        ) {
          result.push({
            label: group.label,
            path: "#",
            isLast: false,
          });
          result.push({
            label: item.label,
            path: item.path,
            isLast: true,
          });
          return result;
        }
      }
    }

    return result;
  }, [location.pathname]);

  return (
    <nav aria-label="Breadcrumb" className="hidden md:block">
      <ol className="flex items-center gap-1 text-sm">
        {segments.map((segment, index) => (
          <li key={segment.path + index} className="flex items-center gap-1">
            {index > 0 && (
              <svg
                className="h-4 w-4 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {segment.isLast ? (
              <span className="font-medium text-slate-700">{segment.label}</span>
            ) : (
              <Link
                to={segment.path}
                className="text-slate-500 hover:text-slate-700"
              >
                {segment.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
