import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { navigation, studentNavigation, studentDashboardItem } from "@/config/navigation";

interface BreadcrumbSegment {
  label: string;
  path: string;
  isLast: boolean;
}

export default function Breadcrumb() {
  const location = useLocation();

  const segments = useMemo((): BreadcrumbSegment[] => {
    const p = location.pathname;
    const isSiswa = p.startsWith("/siswa");
    const basePath = isSiswa ? "/siswa" : "/dashboard";
    const baseLabel = "Dasbor";

    if (p === basePath || p === "/" || p === "/siswa") {
      return [{ label: baseLabel, path: basePath, isLast: true }];
    }

    const result: BreadcrumbSegment[] = [{ label: baseLabel, path: basePath, isLast: false }];

    // dashboard item itself
    if (p === studentDashboardItem.path) {
      return [{ label: baseLabel, path: basePath, isLast: true }];
    }

    const nav = isSiswa ? studentNavigation : navigation;
    for (const entry of nav) {
      if ("items" in entry && entry.items) {
        for (const item of entry.items) {
          if (p === item.path || p.startsWith(item.path + "/")) {
            result.push({ label: entry.label, path: "#", isLast: false });
            result.push({ label: item.label, path: item.path, isLast: true });
            return result;
          }
        }
      } else if ("path" in entry) {
        if (p === entry.path || p.startsWith(entry.path + "/")) {
          result.push({ label: entry.label, path: entry.path, isLast: true });
          return result;
        }
      }
    }

    return result;
  }, [location.pathname]);

  return (
    <nav aria-label="Rute halaman" className="hidden md:block">
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
