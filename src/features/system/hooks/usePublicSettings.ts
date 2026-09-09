import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface PublicSettings {
  hero_image?: string | null;
  hero_text?: string | null;
  hero_text_sub?: string | null;
  school_name?: string | null;
  school_address?: string | null;
  app_name?: string | null;
  school_logo?: string | null;
  favicon?: string | null;
  theme?: string | null;
  primary_color?: string | null;
  sidebar_behavior?: string | null;
}

interface PublicSettingsEnvelope {
  success: boolean;
  message: string;
  data: Record<string, string | null>;
}

export const DEFAULT_PUBLIC_SETTINGS: Record<"hero_text" | "hero_text_sub" | "school_name" | "app_name", string> = {
  hero_text: "Kelola sekolah dengan mudah",
  hero_text_sub: "Satu platform untuk mengelola siswa, guru, akademik, keuangan, dll.",
  school_name: "SchoolCMS",
  app_name: "SchoolCMS",
};

const CACHE_KEY = "schoolcms_public_settings";

export function invalidatePublicSettingsCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}

function readCache(): PublicSettings {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw) as PublicSettings;
  } catch {
    // ignore corrupt cache
  }
  return {};
}

export function usePublicSettings() {
  const [settings, setSettings] = useState<PublicSettings>(readCache);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await api.get<PublicSettingsEnvelope>("/public-settings");
        if (active && res.success) {
          const data = res.data ?? {};
          setSettings(data);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          } catch {
            // ignore quota errors
          }
        }
      } catch {
        // ignore, fallback to cache/defaults
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let active = true;
    const handler = async () => {
      if (!active) return;
      setLoading(true);
      try {
        const res = await api.get<PublicSettingsEnvelope>("/public-settings");
        if (active && res.success) {
          const data = res.data ?? {};
          setSettings(data);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          } catch {
            // ignore quota errors
          }
        }
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    };
    window.addEventListener("schoolcms-settings-changed", handler);
    return () => {
      active = false;
      window.removeEventListener("schoolcms-settings-changed", handler);
    };
  }, []);

  const schoolLogo: string | undefined = settings.school_logo ?? undefined;
  const faviconUrl: string | undefined = settings.favicon ?? undefined;
  const appName = settings.app_name || DEFAULT_PUBLIC_SETTINGS.app_name;

  useEffect(() => {
    if (typeof document === "undefined" || !faviconUrl) return;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
  }, [faviconUrl]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const title = (settings.app_name ?? DEFAULT_PUBLIC_SETTINGS.app_name) as string;
    document.title = title;
  }, [settings.app_name]);

  return {
    settings,
    loading,
    heroImage: settings.hero_image || null,
    heroText: settings.hero_text || DEFAULT_PUBLIC_SETTINGS.hero_text,
    heroTextSub: settings.hero_text_sub || DEFAULT_PUBLIC_SETTINGS.hero_text_sub,
    schoolName: settings.school_name || DEFAULT_PUBLIC_SETTINGS.school_name,
    schoolAddress: settings.school_address || null,
    appName,
    schoolLogo,
    faviconUrl,
    theme: settings.theme ?? "light",
    primaryColor: settings.primary_color ?? null,
    sidebarBehavior: settings.sidebar_behavior ?? "expand",
  };
}
