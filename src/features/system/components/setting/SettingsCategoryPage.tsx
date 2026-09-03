import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PageContainer from "@/components/layout/PageContainer";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { getSettingsCategory } from "../../settings/categoryConfig";
import { formatFieldValue } from "../../settings/settingsUtils";
import SettingField from "./SettingField";
import { settingService } from "../../api/setting.service";
import type { CreateSettingPayload, Setting, UpdateSettingPayload } from "../../api/types";

const SECRET_MASK = "********";

interface SettingsCategoryPageProps {
  group: string;
}

const loadGroup = async (group: string) => settingService.list({ group, per_page: 100 });

export default function SettingsCategoryPage({ group }: SettingsCategoryPageProps) {
  const category = getSettingsCategory(group);

  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<ApiError | null>(null);

  useEffect(() => {
    let active = true;

    loadGroup(group)
      .then((res) => {
        if (!active) return;
        setSettings(res.data);
        const initial: Record<string, string> = {};
        for (const setting of res.data) initial[setting.key] = formatFieldValue(setting);
        setValues(initial);
      })
      .catch((err) => {
        if (!active) return;
        setError(toApiError(err));
        setSettings([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [group]);

  const settingsByKey = useMemo(() => {
    const map: Record<string, Setting> = {};
    for (const s of settings) map[s.key] = s;
    return map;
  }, [settings]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setSaveError(null);
    loadGroup(group)
      .then((res) => {
        setSettings(res.data);
        const initial: Record<string, string> = {};
        for (const setting of res.data) initial[setting.key] = formatFieldValue(setting);
        setValues(initial);
      })
      .catch((err) => setError(toApiError(err)))
      .finally(() => setLoading(false));
  }, [group]);

  if (!category) {
    return (
      <PageContainer className="py-6">
        <Card>Kategori pengaturan tidak ditemukan.</Card>
      </PageContainer>
    );
  }

  const setValue = (key: string, val: string) =>
    setValues((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      for (const field of category.fields) {
        const existing = settingsByKey[field.key];
        const raw = values[field.key] ?? "";
        const isSecret = field.type === "password";
        const unchangedSecret = isSecret && (raw === "" || raw === SECRET_MASK);

        if (existing) {
          const payload: UpdateSettingPayload = {
            ...(isSecret && unchangedSecret
              ? {}
              : { value: raw }),
          };
          await settingService.update(existing.id, payload);
        } else if (!isSecret && raw !== "") {
          const payload: CreateSettingPayload = {
            group,
            key: field.key,
            type: field.type,
            value: raw,
            description: field.description,
            is_encrypted: false,
            is_public: false,
            sort_order: category.fields.indexOf(field),
          };
          await settingService.create(payload);
        }
      }

      toast.success("Pengaturan berhasil disimpan.");
      const res = await loadGroup(group);
      setSettings(res.data);
      const initial: Record<string, string> = {};
      for (const setting of res.data) initial[setting.key] = formatFieldValue(setting);
      setValues(initial);
    } catch (err) {
      const apiError = toApiError(err);
      setSaveError(apiError);
      toast.error("Gagal menyimpan pengaturan", { description: apiError.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer className="py-6">
      <Link
        to="/admin/system/settings"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-on-surface"
      >
        <ChevronLeft className="h-4 w-4" /> Pengaturan
      </Link>

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-on-surface">
          {category.label}
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">{category.description}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Card>
          {loading ? (
            <div className="py-16 text-center text-sm text-slate-500">Memuat data...</div>
          ) : error ? (
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-xl py-10">
              <p className="text-sm text-error">Gagal memuat data pengaturan.</p>
              <Button variant="secondary" onClick={retry}>
                Muat Ulang
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {category.fields.map((field) => {
                const existing = settingsByKey[field.key];
                const isSecret = field.type === "password";
                return (
                  <div
                    key={field.key}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-on-surface">{field.label}</span>
                        {existing ? (
                          <Badge variant="secondary">{field.type}</Badge>
                        ) : (
                          <Badge variant="warning">Belum dikonfigurasi</Badge>
                        )}
                      </div>
                      {field.description && (
                        <p className="mt-1 text-xs text-outline">{field.description}</p>
                      )}
                    </div>
                    <div className="w-full sm:w-64">
                      <SettingField
                        type={field.type}
                        value={values[field.key] ?? ""}
                        onChange={(v) => setValue(field.key, v)}
                        disabled={saving}
                        isSecretEdit={Boolean(existing) && isSecret}
                      />
                    </div>
                  </div>
                );
              })}

              {saveError && !saveError.errors && (
                <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
                  {saveError.message}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <Button type="submit" loading={saving} leftIcon={<Save className="h-4 w-4" />}>
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          )}
        </Card>
      </form>
    </PageContainer>
  );
}
