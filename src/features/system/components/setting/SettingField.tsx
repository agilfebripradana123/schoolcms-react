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
  options?: { value: string; label: string }[];
}

const BOOLEAN_OPTIONS = [
  { value: "1", label: "Ya" },
  { value: "0", label: "Tidak" },
];

/**
 * Type-aware input for a configuration value.
 *
 * - text       → Textarea
 * - integer    → Number input
 * - boolean    → Select Ya/Tidak
 * - email      → Email input
 * - url        → URL input
 * - password   → Password input
 * - timezone   → Timezone select
 * - time       → Time input
 * - color      → Color picker
 * - select     → Select berdasarkan options
 * - file/string → Text input
 *
 * Secrets (password) are never prefilled from the masked API value.
 */
export default function SettingField({
  settingKey,
  type,
  value,
  onChange,
  disabled = false,
  isSecretEdit = false,
  placeholder,
  options,
}: SettingFieldProps) {
  const common = {
    value,
    disabled,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange(e.target.value),
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
        <Input
          type="email"
          placeholder={placeholder ?? "nama@sekolah.sch.id"}
          {...common}
        />
      );

    case "url":
      return (
        <Input
          type="url"
          placeholder={placeholder ?? "https://..."}
          {...common}
        />
      );

    case "password":
      return (
        <Input
          key={inputKey}
          type="password"
          placeholder={
            isSecretEdit
              ? "Kosongkan jika tidak diubah"
              : "Masukkan nilai rahasia"
          }
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
          ].map((tz) => ({
            value: tz,
            label: tz,
          }))}
          placeholder="Pilih zona waktu"
          isDisabled={disabled}
        />
      );

    case "time":
      return <Input type="time" {...common} />;

    case "color":
      return (
        <Input
          type="color"
          {...common}
          className="h-12 w-full p-1"
        />
      );

    case "select":
      return (
        <AppSelect
          value={value}
          onChange={(v) => onChange(v ?? "")}
          options={options ?? []}
          placeholder={placeholder ?? "Pilih nilai"}
          isDisabled={disabled}
        />
      );

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
          placeholder={
            placeholder ??
            (type === "file" ? "Nilai file / path" : "Nilai")
          }
          {...common}
        />
      );
  }
}
