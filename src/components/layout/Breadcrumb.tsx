import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { navigation } from "../../app/config/navigation";
import type { NavigationItem } from "../../types/navigation";

function findLabelByPath(
  items: NavigationItem[],
  pathname: string
): string | undefined {
  for (const item of items) {
    if (item.path === pathname) return item.label;
    if (item.children) {
      const childLabel = findLabelByPath(item.children, pathname);
      if (childLabel) return childLabel;
    }
  }
  return undefined;
}

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; path: string; isLast: boolean }[] = [];

  let currentPath = "";
  const allItems = navigation.flatMap((g) => g.items);

  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const isLast = i === segments.length - 1;
    const label = findLabelByPath(allItems, currentPath);

    if (label) {
      crumbs.push({
        label,
        path: currentPath,
        isLast,
      });
    } else {
      const formatted = segments[i]
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      crumbs.push({
        label: formatted,
        path: currentPath,
        isLast,
      });
    }
  }

  return crumbs;
}

export function Breadcrumb() {
  const location = useLocation();
  const crumbs = buildBreadcrumbs(location.pathname);

  if (crumbs.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-slate-500">
      <Link to="/dashboard" className="hover:text-slate-700">
        Home
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.path} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {crumb.isLast ? (
            <span className="font-medium text-slate-900">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-slate-700">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
