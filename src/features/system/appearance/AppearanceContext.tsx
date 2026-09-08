import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { settingService } from "../api/setting.service";

type Theme = "light" | "dark" | "system";
type SidebarBehavior = "expanded" | "collapsed";

interface AppearanceState {
  theme: Theme;
  primaryColor: string;
  sidebarBehavior: SidebarBehavior;
}

interface AppearanceContextValue extends AppearanceState {
  reloadAppearance: () => Promise<void>;
}

const DEFAULT_APPEARANCE: AppearanceState = {
  theme: "light",
  primaryColor: "#7C3AED",
  sidebarBehavior: "expanded",
};

const AppearanceContext =
  createContext<AppearanceContextValue | null>(null);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") {
    return;
  }

  const resolvedTheme =
    theme === "system" ? getSystemTheme() : theme;

  document.documentElement.setAttribute(
    "data-theme",
    resolvedTheme,
  );

  document.documentElement.style.colorScheme =
    resolvedTheme;
}

function applyPrimaryColor(color: string) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  /*
   * Primary utama
   */
  root.style.setProperty("--primary", color);
  root.style.setProperty("--color-primary", color);
  root.style.setProperty("--primary-color", color);

  /*
   * Primary container.
   *
   * Untuk sementara menggunakan warna primary yang sama.
   * CSS opacity pada komponen akan membuat tampilan
   * container tetap lebih lembut.
   */
  root.style.setProperty("--primary-container", color);
  root.style.setProperty(
    "--color-primary-container",
    color,
  );

  /*
   * Surface tint mengikuti primary.
   */
  root.style.setProperty("--surface-tint", color);
  root.style.setProperty(
    "--color-surface-tint",
    color,
  );
}

function applySidebarBehavior(
  behavior: SidebarBehavior,
) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute(
    "data-sidebar",
    behavior,
  );
}

function applyAppearance(
  appearance: AppearanceState,
) {
  applyTheme(appearance.theme);
  applyPrimaryColor(appearance.primaryColor);
  applySidebarBehavior(appearance.sidebarBehavior);
}

export function AppearanceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [appearance, setAppearance] =
    useState<AppearanceState>(DEFAULT_APPEARANCE);

  const reloadAppearance = useCallback(async () => {
    try {
      const response = await settingService.list({
        group: "appearance",
        per_page: 100,
      });

      const settings = response.data;

      const values: Record<string, string> = {};

      for (const setting of settings) {
        values[setting.key] = setting.value ?? "";
      }

      const nextAppearance: AppearanceState = {
        theme:
          values.theme === "dark" ||
          values.theme === "system"
            ? values.theme
            : "light",

        primaryColor:
          values.primary_color ||
          DEFAULT_APPEARANCE.primaryColor,

        sidebarBehavior:
          values.sidebar_behavior === "collapsed"
            ? "collapsed"
            : "expanded",
      };

      setAppearance(nextAppearance);
      applyAppearance(nextAppearance);
    } catch (error) {
      console.error(
        "Gagal memuat appearance settings:",
        error,
      );

      setAppearance(DEFAULT_APPEARANCE);
      applyAppearance(DEFAULT_APPEARANCE);
    }
  }, []);

  /*
   * Load Appearance ketika aplikasi pertama kali dibuka.
   */
  useEffect(() => {
    void reloadAppearance();
  }, [reloadAppearance]);

  /*
   * Jika Theme = System, ikuti perubahan
   * tema sistem operasi secara otomatis.
   */
  useEffect(() => {
    if (appearance.theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    const handleChange = () => {
      applyTheme("system");
    };

    mediaQuery.addEventListener(
      "change",
      handleChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleChange,
      );
    };
  }, [appearance.theme]);

  /*
   * Pastikan perubahan state selalu diterapkan
   * ke document.
   */
  useEffect(() => {
    applyAppearance(appearance);
  }, [appearance]);

  return (
    <AppearanceContext.Provider
      value={{
        ...appearance,
        reloadAppearance,
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);

  if (!context) {
    throw new Error(
      "useAppearance must be used within an AppearanceProvider",
    );
  }

  return context;
}