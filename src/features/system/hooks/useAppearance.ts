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

  // Sidebar text colors: softer than pure white for less eye strain.
  // Background: darkened variant of primaryColor via color-mix; fallback deeper when unset.
  const sidebarBg = useMemo(() => {
    if (!primaryColor || !/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(primaryColor)) {
      return resolvedTheme === "dark" ? "#040507" : "#0a0d11";
    }
    return resolvedTheme === "dark"
      ? `color-mix(in srgb, ${primaryColor} 20%, #020304)`
      : `color-mix(in srgb, ${primaryColor} 40%, #050608)`;
  }, [primaryColor, resolvedTheme]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.documentElement;
    if (resolvedTheme === "dark") {
      el.classList.add("dark");
      el.style.colorScheme = "dark";
      el.style.setProperty("--sidebar-text", "#dbe2ea");
      el.style.setProperty("--sidebar-text-muted", "#9aa5b3");
    } else {
      el.classList.remove("dark");
      el.style.colorScheme = "light";
      el.style.setProperty("--sidebar-text", "#e2e8f0");
      el.style.setProperty("--sidebar-text-muted", "#94a3b8");
    }
    el.style.setProperty("--sidebar-bg", sidebarBg);
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
