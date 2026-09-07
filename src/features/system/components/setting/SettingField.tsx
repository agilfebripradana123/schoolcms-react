import { useRef, useState } from "react";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { settingService } from "../../api/setting.service";
import type { SettingType } from "../../api/types";

interface SettingFieldProps {
  settingKey?: string;
  type: SettingType;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isSecretEdit?: boolean;
  placeholder?: string;
}

const BOOLEAN_OPTIONS = [
  { value: "1", label: "Ya" },
  { value: "0", label: "Tidak" },
];

/**
 * Type-aware input for a configuration value. `type` controls which control is
 * rendered. Secrets (password) are never prefilled from the masked API value.
 */
export default function SettingField({
  settingKey,
  type,
  value,
  onChange,
  disabled = false,
  isSecretEdit = false,
  placeholder,
}: SettingFieldProps) {
  const common = {
    value,
    disabled,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
  };
  const inputKey = settingKey ? `${settingKey}-input` : undefined;

  switch (type) {
    case "text":
      return (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Nilai teks panjang"}
          disabled={disabled}
        />
      );
    case "integer":
      return (
        <Input
          type="number"
          placeholder={placeholder ?? "0"}
          {...common}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "boolean":
      return (
        <AppSelect
          value={value}
          onChange={(v) => onChange(v ?? "")}
          options={BOOLEAN_OPTIONS}
          placeholder="Pilih Ya / Tidak"
          isDisabled={disabled}
        />
      );
    case "email":
      return (
        <Input key={inputKey} type="email" placeholder={placeholder ?? "nama@sekolah.sch.id"} {...common} />
      );
    case "url":
      return <Input key={inputKey} type="url" placeholder={placeholder ?? "https://..."} {...common} />;
    case "password":
      return (
        <Input
          key={inputKey}
          type="password"
          placeholder={isSecretEdit ? "Kosongkan jika tidak diubah" : "Masukkan nilai rahasia"}
          autoComplete="new-password"
          {...common}
        />
      );
    case "timezone":
      return (
        <AppSelect
          key={inputKey}
          value={value}
          onChange={(v) => onChange(v ?? "")}
          options={[
            "Asia/Jakarta",
            "Asia/Makassar",
            "Asia/Pontianak",
            "Asia/Jayapura",
            "UTC",
          ].map((tz) => ({ value: tz, label: tz }))}
          placeholder="Pilih zona waktu"
          isDisabled={disabled}
        />
      );
    case "time":
      return <Input key={inputKey} type="time" {...common} />;
    case "color":
      return <Input key={inputKey} type="color" {...common} className="h-12 w-full p-1" />;
    case "file":
      return (
        <FileField
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
        />
      );
    case "select":
    case "string":
    default:
      return (
        <Input
          key={inputKey}
          type="text"
          placeholder={placeholder ?? "Nilai"}
          {...common}
        />
      );
  }
}

function FileField({
  value,
  onChange,
  disabled = false,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const isBusy = disabled || uploading;

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await settingService.upload(file);
      onChange(url);
      toast.success("Gambar berhasil diupload.");
    } catch {
      toast.error("Upload gagal", { description: "Coba lagi atau isi URL manual." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <img
            src={value}
            alt="Pratinjau"
            className="h-24 w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={isBusy}
            className="absolute right-1.5 top-1.5 rounded-lg bg-black/50 p-1 text-white transition-colors hover:bg-black/70 disabled:opacity-50"
            aria-label="Hapus gambar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex h-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
          <ImageIcon className="h-5 w-5" />
          <span className="text-xs">Belum ada gambar</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handlePick}
        disabled={isBusy}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="flex-1"
          loading={uploading}
          disabled={isBusy}
          leftIcon={<Upload className="h-3.5 w-3.5" />}
          onClick={() => inputRef.current?.click()}
        >
          {value ? "Ganti gambar" : "Upload gambar"}
        </Button>
      </div>
      <Input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "atau tempel URL gambar..."}
      />
    </div>
  );
}
