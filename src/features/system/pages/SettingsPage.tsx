import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Badge from "@/components/ui/Badge";
import PageContainer from "@/components/layout/PageContainer";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { settingsCategories } from "../settings/categoryConfig";
import { settingService } from "../api/setting.service";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    let active = true;

    settingService
      .list({ per_page: 100 })
      .then((res) => {
        if (!active) return;
        const map: Record<string, number> = {};
        for (const setting of res.data) {
          const key = setting.group || "__nogroup";
          map[key] = (map[key] ?? 0) + 1;
        }
        setCounts(map);
      })
      .catch((err) => {
        if (!active) return;
        setError(toApiError(err));
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <PageContainer className="py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-on-surface">
          Pengaturan
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Kelola konfigurasi sistem sekolah per kategori.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-error-container px-3 py-2 text-sm text-error">
          Gagal memuat jumlah pengaturan: {error.message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {settingsCategories.map((category) => {
          const CountIcon = category.icon;
          const count = counts[category.group] ?? 0;
          return (
            <button
              key={category.group}
              type="button"
              onClick={() => navigate(category.route)}
              className="group flex flex-col rounded-3xl border border-slate-200 bg-surface-container-lowest p-5 text-left shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-colors hover:border-primary-container hover:bg-surface-container-low"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-container/15 text-primary-container">
                <CountIcon className="h-5 w-5" />
              </div>
              <span className="mt-3 font-display text-base font-semibold text-on-surface">
                {category.label}
              </span>
              <span className="mt-1 text-xs text-on-surface-variant">
                {category.description}
              </span>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <Badge variant="secondary">{count} pengaturan</Badge>
                <span className="flex items-center gap-0.5 text-xs font-semibold text-primary-container">
                  Kelola
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </PageContainer>
  );
}
