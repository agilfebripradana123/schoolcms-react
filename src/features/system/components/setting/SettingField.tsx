import { Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import type { SettingType } from "../../api/types";

interface SettingFieldProps {
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
          value={value || "1"}
          onChange={(v) => onChange(v ?? "1")}
          options={BOOLEAN_OPTIONS}
          placeholder="Pilih Ya / Tidak"
          isDisabled={disabled}
        />
      );
    case "email":
      return (
        <Input type="email" placeholder={placeholder ?? "nama@sekolah.sch.id"} {...common} />
      );
    case "url":
      return <Input type="url" placeholder={placeholder ?? "https://..."} {...common} />;
    case "password":
      return (
        <Input
          type="password"
          placeholder={isSecretEdit ? "Kosongkan jika tidak diubah" : "Masukkan nilai rahasia"}
          autoComplete="new-password"
          {...common}
        />
      );
    case "timezone":
      return (
        <AppSelect
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
      return <Input type="time" {...common} />;
    case "color":
      return <Input type="color" {...common} className="h-12 w-full p-1" />;
    case "select":
    case "file":
    case "string":
    default:
      return (
        <Input
          type="text"
          placeholder={placeholder ?? (type === "file" ? "Nilai file / path" : "Nilai")}
          {...common}
        />
      );
  }
}
