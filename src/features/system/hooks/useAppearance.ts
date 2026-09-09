import { useEffect, useMemo } from "react";
import { usePublicSettings } from "./usePublicSettings";

export function useAppearance() {
  const { theme, primaryColor, sidebarBehavior } = usePublicSettings();

  const resolvedTheme: "dark" | "light" = useMemo(() => {
    if (theme === "dark") return "dark";
    if (theme === "system") {
      return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  }, [theme]);

  // Sidebar: same dark background for both light and dark theme.
  // Text colors: bright for readability on dark sidebar.
  const sidebarBg = useMemo(() => {
    if (!primaryColor || !/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(primaryColor)) {
      return "#06080a";
    }
    return `color-mix(in srgb, ${primaryColor} 15%, #030405)`;
  }, [primaryColor]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.documentElement;
    if (resolvedTheme === "dark") {
      el.classList.add("dark");
      el.style.colorScheme = "dark";
    } else {
      el.classList.remove("dark");
      el.style.colorScheme = "light";
    }
    el.style.setProperty("--sidebar-bg", sidebarBg);
    el.style.setProperty("--sidebar-text", "#f1f5f9");
    el.style.setProperty("--sidebar-text-muted", "#cbd5e1");
  }, [resolvedTheme, sidebarBg]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.documentElement;
    if (primaryColor && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(primaryColor)) {
      el.style.setProperty("--color-primary", primaryColor);
      el.style.setProperty("--color-primary-container", primaryColor);
      el.style.setProperty("--sidebar-accent", primaryColor);
    } else {
      el.style.removeProperty("--color-primary");
      el.style.removeProperty("--color-primary-container");
      el.style.removeProperty("--sidebar-accent");
    }
  }, [primaryColor]);

  return { theme, resolvedTheme, primaryColor, sidebarBehavior };
}
