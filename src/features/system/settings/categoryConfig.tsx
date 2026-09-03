import {
  Settings2,
  Bell,
  Mail,
  MessageCircle,
  CreditCard,
  Shield,
  DatabaseBackup,
  Palette,
  type LucideIcon,
} from "lucide-react";
import type { SettingType } from "../api/types";

/**
 * Field metadata for a single configuration entry within a category.
 *
 * NOTE: This describes the EXPECTED structure/type only. It never fabricates
 * actual settings data — a field with no matching backend record renders as
 * "Belum dikonfigurasi".
 */
export interface SettingsFieldConfig {
  key: string;
  label: string;
  type: SettingType;
  description?: string;
}

export interface SettingsCategoryConfig {
  group: string;
  label: string;
  description: string;
  route: string;
  icon: LucideIcon;
  fields: SettingsFieldConfig[];
}

export const settingsCategories: SettingsCategoryConfig[] = [
  {
    group: "general",
    label: "Umum",
    description: "Pengaturan dasar aplikasi dan sekolah.",
    route: "/admin/system/settings/general",
    icon: Settings2,
    fields: [
      { key: "app_name", label: "Nama aplikasi", type: "string" },
      { key: "school_name", label: "Nama sekolah", type: "string" },
      { key: "school_logo", label: "Logo sekolah", type: "file", description: "Upload file belum didukung backend — diisi via nilai teks/path." },
      { key: "favicon", label: "Favicon", type: "file", description: "Upload file belum didukung backend — diisi via nilai teks/path." },
      { key: "timezone", label: "Zona waktu", type: "timezone" },
    ],
  },
  {
    group: "notifications",
    label: "Notifikasi",
    description: "Pengaturan notifikasi email, WhatsApp, dan push.",
    route: "/admin/system/settings/notifications",
    icon: Bell,
    fields: [
      { key: "email_notification", label: "Email notification", type: "boolean" },
      { key: "whatsapp_notification", label: "WhatsApp notification", type: "boolean" },
      { key: "push_notification", label: "Push notification", type: "boolean" },
    ],
  },
  {
    group: "email",
    label: "Email",
    description: "Konfigurasi server email (SMTP).",
    route: "/admin/system/settings/email",
    icon: Mail,
    fields: [
      { key: "smtp_host", label: "SMTP host", type: "string" },
      { key: "smtp_port", label: "SMTP port", type: "integer" },
      { key: "smtp_username", label: "Username", type: "string" },
      { key: "smtp_password", label: "Password", type: "password" },
      { key: "smtp_encryption", label: "Encryption", type: "string", description: "Opsi (TLS/SSL) belum disediakan backend — diisi sebagai teks." },
      { key: "smtp_from_address", label: "From address", type: "email" },
    ],
  },
  {
    group: "whatsapp",
    label: "WhatsApp",
    description: "Konfigurasi integrasi WhatsApp.",
    route: "/admin/system/settings/whatsapp",
    icon: MessageCircle,
    fields: [
      { key: "whatsapp_provider", label: "Provider", type: "string", description: "Pilihan provider belum disediakan backend — diisi sebagai teks." },
      { key: "whatsapp_api_url", label: "API URL", type: "url" },
      { key: "whatsapp_api_key", label: "API key", type: "password" },
      { key: "whatsapp_sender", label: "Sender", type: "string" },
    ],
  },
  {
    group: "payment",
    label: "Pembayaran",
    description: "Konfigurasi gateway pembayaran.",
    route: "/admin/system/settings/payment",
    icon: CreditCard,
    fields: [
      { key: "payment_gateway", label: "Payment gateway", type: "string", description: "Pilihan gateway belum disediakan backend — diisi sebagai teks." },
      { key: "payment_mode", label: "Mode", type: "string", description: "Mode sandbox/live belum disediakan backend — diisi sebagai teks." },
      { key: "payment_api_key", label: "API key", type: "password" },
      { key: "payment_merchant_id", label: "Merchant ID", type: "string" },
    ],
  },
  {
    group: "security",
    label: "Keamanan",
    description: "Pengaturan keamanan sesi dan akun.",
    route: "/admin/system/settings/security",
    icon: Shield,
    fields: [
      { key: "session_timeout", label: "Session timeout", type: "integer" },
      { key: "maximum_login_attempts", label: "Maximum login attempts", type: "integer" },
      { key: "password_minimum_length", label: "Password minimum length", type: "integer" },
      { key: "two_factor_authentication", label: "Two-factor authentication", type: "boolean" },
    ],
  },
  {
    group: "backup",
    label: "Backup",
    description: "Pengaturan backup otomatis.",
    route: "/admin/system/settings/backup",
    icon: DatabaseBackup,
    fields: [
      { key: "automatic_backup", label: "Automatic backup", type: "boolean" },
      { key: "backup_schedule", label: "Schedule", type: "time" },
      { key: "backup_retention", label: "Retention (hari)", type: "integer" },
      { key: "backup_storage", label: "Storage", type: "string", description: "Pilihan storage belum disediakan backend — diisi sebagai teks." },
    ],
  },
  {
    group: "appearance",
    label: "Tampilan",
    description: "Pengaturan tema dan tampilan aplikasi.",
    route: "/admin/system/settings/appearance",
    icon: Palette,
    fields: [
      { key: "theme", label: "Theme", type: "string", description: "Pilihan tema belum disediakan backend — diisi sebagai teks." },
      { key: "primary_color", label: "Primary color", type: "color" },
      { key: "sidebar_behavior", label: "Sidebar behavior", type: "string", description: "Pilihan perilaku sidebar belum disediakan backend — diisi sebagai teks." },
    ],
  },
];

export function getSettingsCategory(group: string): SettingsCategoryConfig | undefined {
  return settingsCategories.find((c) => c.group === group);
}
