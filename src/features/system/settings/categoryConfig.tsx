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
  placeholder?: string;
  isPublic?: boolean;
  uploadable?: boolean;
  options?: { value: string; label: string }[];
  /** Nilai bawaan aplikasi, dipakai tombol "Gunakan Default". */
  defaultValue?: string;
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
      { key: "app_name", label: "Nama aplikasi", type: "string", description: "Nama yang ditampilkan di header dan halaman login.", placeholder: "Contoh: SchoolCMS", isPublic: true },
      { key: "school_name", label: "Nama sekolah", type: "string", description: "Nama resmi sekolah (misal: SMA Negeri 1 Jakarta).", placeholder: "Contoh: SMA Negeri 1 Jakarta", isPublic: true },
      { key: "school_address", label: "Alamat sekolah", type: "text", description: "Alamat lengkap sekolah (misal: kantor, alamat email).", placeholder: "Contoh: Jl. Pendidikan No. 1, Jakarta Pusat", isPublic: true },
      { key: "school_logo", label: "Logo sekolah", type: "file", description: "Upload logo sekolah (format: PNG/JPG).", placeholder: "", isPublic: true },
      { key: "favicon", label: "Favicon", type: "file", description: "Gambar favicon untuk tab browser (format: ICO/PNG).", placeholder: "", isPublic: true },
      { key: "hero_image", label: "Gambar hero login", type: "file", description: "Gambar latar belakang halaman login.", placeholder: "", isPublic: true },
      { key: "hero_text", label: "Teks judul login", type: "text", description: "Judul utama yang ditampilkan di halaman login.", placeholder: "Contoh: Kelola sekolah dengan mudah", isPublic: true },
      { key: "hero_text_sub", label: "Teks sub judul login", type: "text", description: "Subteks di bawah judul login (misal: deskripsi singkat).", placeholder: "Contoh: Satu platform untuk mengelola sekolah", isPublic: true },
      { key: "timezone", label: "Zona waktu", type: "timezone", description: "Zona waktu yang digunakan oleh aplikasi (misal: Jakarta, Makassar).", placeholder: "" },
    ],
  },
  {
    group: "notifications",
    label: "Notifikasi",
    description: "Pengaturan notifikasi email, WhatsApp, dan push.",
    route: "/admin/system/settings/notifications",
    icon: Bell,
    fields: [
      { key: "email_notification", label: "Notifikasi email", type: "boolean", description: "Kirim notifikasi via email kepada pengguna (misal: pengumuman, tagihan)." },
      { key: "whatsapp_notification", label: "Notifikasi WhatsApp", type: "boolean", description: "Kirim notifikasi via WhatsApp kepada pengguna." },
      { key: "push_notification", label: "Notifikasi push", type: "boolean", description: "Kirim notifikasi push ke perangkat pengguna." },
    ],
  },
  {
    group: "email",
    label: "Email",
    description: "Konfigurasi server email (SMTP).",
    route: "/admin/system/settings/email",
    icon: Mail,
    fields: [
      { key: "smtp_host", label: "SMTP host", type: "string", description: "Alamat server SMTP untuk kirim email (misal: mail.sekolah.sch.id).", placeholder: "Contoh: mail.sekolah.sch.id" },
      { key: "smtp_port", label: "SMTP port", type: "integer", description: "Port server SMTP (umum: 587 untuk TLS, 465 untuk SSL).", placeholder: "Contoh: 587" },
      { key: "smtp_username", label: "Username SMTP", type: "string", description: "Username akun SMTP untuk autentikasi.", placeholder: "Contoh: no-reply@sekolah.sch.id" },
      { key: "smtp_password", label: "Password SMTP", type: "password", description: "Password akun SMTP (disimpan terenkripsi)." },
      { key: "smtp_encryption", label: "Enkripsi SMTP", type: "string", description: "Jenis enkripsi koneksi (TLS/SSL). Opsi belum disediakan backend — diisi sebagai teks.", placeholder: "Contoh: tls" },
      { key: "smtp_from_address", label: "Alamat pengirim", type: "email", description: "Alamat email yang tampil sebagai pengirim.", placeholder: "Contoh: no-reply@sekolah.sch.id" },
    ],
  },
  {
    group: "whatsapp",
    label: "WhatsApp",
    description: "Konfigurasi integrasi WhatsApp.",
    route: "/admin/system/settings/whatsapp",
    icon: MessageCircle,
    fields: [
      { key: "whatsapp_provider", label: "Provider WhatsApp", type: "string", description: "Provider layanan WhatsApp (jika tersedia)." },
      { key: "whatsapp_api_url", label: "API URL WhatsApp", type: "url", description: "URL endpoint API WhatsApp." },
      { key: "whatsapp_api_key", label: "API key WhatsApp", type: "password", description: "Kunci API untuk integrasi WhatsApp." },
      { key: "whatsapp_sender", label: "Sender WhatsApp", type: "string", description: "Nomor atau nama sender WhatsApp." },
    ],
  },
  {
    group: "payment",
    label: "Pembayaran",
    description: "Konfigurasi gateway pembayaran.",
    route: "/admin/system/settings/payment",
    icon: CreditCard,
    fields: [
      { key: "payment_gateway", label: "Payment gateway", type: "string", description: "Nama gateway pembayaran yang digunakan (misal: Xendit, Midtrans).", placeholder: "Contoh: Xendit" },
      { key: "payment_mode", label: "Mode pembayaran", type: "string", description: "Mode gateway: sandbox (uji coba) atau live (produksi).", placeholder: "Contoh: sandbox" },
      { key: "payment_api_key", label: "API key pembayaran", type: "password", description: "Kunci API dari provider payment gateway." },
      { key: "payment_merchant_id", label: "Merchant ID", type: "string", description: "ID merchant dari provider payment gateway.", placeholder: "Contoh: MCH-123456" },
    ],
  },
  {
    group: "security",
    label: "Keamanan",
    description: "Pengaturan keamanan sesi dan akun.",
    route: "/admin/system/settings/security",
    icon: Shield,
    fields: [
      {
        key: "session_timeout",
        label: "Batas waktu sesi (menit)",
        type: "integer",
        description: "Waktu maksimal sesi login sebelum otomatis logout (dalam menit). Kosongkan atau isi 0 untuk tidak ada batas.",
        placeholder: "Contoh: 30 (menit)",
        defaultValue: "30",
      },
      {
        key: "maximum_login_attempts",
        label: "Batas percobaan login",
        type: "integer",
        description: "Jumlah maksimal percobaan login gagal sebelum akun dikunci. Kosongkan atau isi 0 untuk tidak ada batas.",
        placeholder: "Contoh: 5 (kali)",
        defaultValue: "5",
      },
      {
        key: "password_minimum_length",
        label: "Panjang password minimal",
        type: "integer",
        description: "Panjang minimal password (jumlah karakter). Kosongkan atau isi 0 untuk tidak ada aturan.",
        placeholder: "Contoh: 8 (karakter)",
        defaultValue: "8",
      },
      {
        key: "two_factor_authentication",
        label: "Autentikasi dua faktor (2FA)",
        type: "boolean",
        description: "Wajibkan kode OTP tambahan saat login untuk keamanan ekstra.",
      },
    ],
  },
  {
    group: "backup",
    label: "Backup",
    description: "Pengaturan backup otomatis.",
    route: "/admin/system/settings/backup",
    icon: DatabaseBackup,
    fields: [
      { key: "automatic_backup", label: "Backup otomatis", type: "boolean", description: "Aktifkan backup otomatis database sekolah." },
      { key: "backup_schedule", label: "Jadwal backup", type: "time", description: "Waktu harian untuk melakukan backup (format: HH:MM).", placeholder: "Contoh: 02:00" },
      { key: "backup_retention", label: "Retensi backup (hari)", type: "integer", description: "Lama backup disimpan sebelum dihapus (misal: 30 hari).", placeholder: "Contoh: 30", defaultValue: "30" },
      { key: "backup_storage", label: "Lokasi penyimpanan", type: "string", description: "Lokasi penyimpanan backup (misal: penyedia cloud).", placeholder: "Contoh: AWS S3" },
    ],
  },
  {
    group: "appearance",
    label: "Tampilan",
    description: "Pengaturan tema dan tampilan aplikasi.",
    route: "/admin/system/settings/appearance",
    icon: Palette,
    fields: [
      { key: "theme", label: "Tema tampilan", type: "select", description: "Pilih tema tampilan aplikasi (terang, gelap, atau ikuti sistem).", options: [{ value: "light", label: "Terang" }, { value: "dark", label: "Gelap" }, { value: "system", label: "Ikuti sistem" }], isPublic: true, defaultValue: "light" },
      { key: "primary_color", label: "Warna utama", type: "color", description: "Warna utama tema aplikasi (misal: ungu untuk SchoolCMS).", isPublic: true, defaultValue: "#630ed4" },
      { key: "sidebar_behavior", label: "Perilaku sidebar", type: "select", description: "Pilih perilaku sidebar (selalu terbuka, tertutup, atau otomatis).", options: [{ value: "expand", label: "Selalu terbuka" }, { value: "collapse", label: "Selalu tertutup" }, { value: "collapsible", label: "Otomatis (bisa dilipat)" }], isPublic: true, defaultValue: "expand" },
    ],
  },
];

export function getSettingsCategory(group: string): SettingsCategoryConfig | undefined {
  return settingsCategories.find((c) => c.group === group);
}
