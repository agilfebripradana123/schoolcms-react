# School CMS React

Sebuah Sistem Manajemen Sekolah (School Management System) berbasis React dengan TypeScript, Vite, dan Tailwind CSS. Aplikasi ini menyediakan fitur lengkap untuk manajemen akademik, administrasi, keuangan, komunikasi, dan fitur siswa/guru.

## Aplikasi Ini Apa?
Sistem manajemen sekolah modern yang mencakup:
- Manajemen akademik: Mata pelajaran, kelas, jadwal, nilai, rapor, kurikulum, dan siswa
- Administrasi: PPBD, keuangan, dokumen, surat, sistem, dan fitur admin
- Fitur siswa & guru: Portal mandiri, laporan, transaksi, fitur akademik, manajemen kelas, dan dokumentasi
- Antarmuka modern: Desain premium EdTech dengan UI/UX yang intuitif dan konsisten

## Dibuat dengan Apa?
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **UI Library**: Tailwind CSS 4 + Headless UI components
- **State Management**: Context API (AuthContext)
- **Routing**: React Router DOM 7
- **API Client**: Axios
- **UI Components**: Radix UI + Lucide React icons
- **Styling**: Tailwind CSS with custom design system
- **Arsitektur**: Feature-based modular structure dengan fitur terpisah

## Fitur Utama
### Akademik
- Jadwal pelajaran dan kelas
- Manajemen nilai dan rapor
- Kurikulum dan mata pelajaran
- Penjadwalan tugas dan ujian
- Laporan akademik dan statistik

### Administrasi
- PPBD (Pendaftaran dan Penerimaan)
- Keuangan: Tagihan, pembayaran, transaksi, dan laporan keuangan
- Dokumen: Surat masuk, surat keluar, dokumen administratif
- Sistem: Pengaturan peran, hak akses, dan audit log

### Komunikasi
- Pengumuman dan pesan
- Kalender sekolah dan pertemuan
- Notifikasi dan pesan internal
- Fitur diskusi dan forum

### Fitur Siswa
- Portal mandiri: Profil, jadwal, nilai, dan transaksi
- Laporan akademik dan keuangan
- Fitur transaksi: Pembayaran tagihan dan beasiswa
- Notifikasi dan pengumuman khusus siswa

### Fitur Guru & Staf
- Manajemen kelas dan jadwal
- Penilaian dan laporan akademik
- Manajemen dokumen dan surat
- Fitur kehadiran dan cuti

### Desain Modern
- UI/UX premium dengan desain sistem konsisten
- Responsif untuk semua perangkat (desktop, tablet, mobile)
- Aksesibilitas dan performa tinggi
- Desain warna yang harmonis dengan palet utama (violet, navy, dan warna netral)

## Struktur Project
```
src/
├── app/               # Router utama dan layout dasar
├── components/        # Komponen UI terpisah (layout, header, sidebar, modal)
├── config/            # Konfigurasi aplikasi (navigasi, tipe data, API base)
├── features/          # Fitur utama terpisah dengan struktur modular
│   ├── auth/          # Autentikasi dan otorisasi
│   ├── academic/      # Manajemen akademik (mata pelajaran, kelas, nilai)
│   ├── administration/ # Administrasi (PPBD, keuangan, dokumen)
│   ├── communication/  # Komunikasi (pengumuman, kalender, notifikasi)
│   ├── finance/       # Keuangan (tagihan, pembayaran, laporan)
│   ├── students/      # Fitur siswa (portal, laporan, transaksi)
│   ├── teachers-staff/ # Fitur guru dan staf (manajemen kelas, nilai)
│   ├── ppdb/          # PPBD (pendaftaran dan penerimaan)
│   ├── examinations/  # Ujian dan penilaian
│   ├── facilities/    # Sarana dan prasarana (ruangan, aset, perawatan)
│   ├── development/   # Pengembangan (ekstrakurikuler, prestasi, pelanggaran)
│   ├── reports/       # Laporan terpisah (akademik, keuangan, siswa)
│   └── system/        # Sistem (peran, hak akses, pengguna, log)
├── lib/               # Utility, layanan API, dan konfigurasi global
├── pages/             # Halaman utama (dashboard, login, not found)
├── styles/            # Styling global (Tailwind, CSS, theme tokens)
└── types/             # Tipe data dan interface aplikasi
```

Each feature module contains:
- pages/       # Halaman spesifik fitur
- components/  # Komponen UI fitur
- lib/         # Layanan khusus fitur
- hooks/       # Hook khusus fitur
- types/       # Tipe data fitur

## Backend API
Proyek ini menggunakan Backend API Laravel yang berada di repository terpisah:

- **Repository**: [schoolcms-laravel](https://github.com/agilfebripradana123/schoolcms-laravel)
- **Framework**: Laravel (PHP)
- **API**: RESTful API dengan Laravel Sanctum untuk autentikasi
- **Database**: MySQL
- **Penggunaan API**: Frontend React terhubung ke API backend melalui Axios dengan endpoint yang telah ditentukan di file konfigurasi lingkungan `.env`

## Kontribusi

1. **Fork** repositori
2. **Clone** repositori ke mesin lokal
3. **Buat branch** untuk fitur/perbaikan: `git checkout -b feature/name`
4. **Lakukan perubahan** dan commit: `git commit -m "description"`
5. **Push** ke fork: `git push origin feature/name`
6. **Buat Pull Request** ke repositori utama

## Lisensi
[MIT](LICENSE)

## Kontak
Untuk pertanyaan atau dukungan, hubungi tim pengembang melalui email atau kontak di repositori.