# 01 — Plan: SchoolCMS React

## Tujuan

SPA frontend untuk manajemen sekolah: akademik, administrasi, keuangan, komunikasi, PPDB, portal siswa/guru. Terhubung ke backend Laravel via REST API (Axios + Sanctum Bearer token).

## Stack

| Lapisan | Teknologi |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| State | Context API (`AuthContext`) |
| HTTP | Axios |
| UI | Radix UI, Lucide React, react-select, sonner (toast) |
| Lint | oxlint + ESLint/Prettier |
| E2E | Playwright (chromium) |

## Struktur

Feature-based modular. 17 modul di `src/features/`:

```
src/
├── app/            # router utama + layout dasar
├── components/     # UI bersama (layout, header, sidebar, modal)
├── config/         # navigation.ts (menu/route)
├── features/
│   ├── academic/ administration/ auth/ communication/
│   ├── dashboard/ development/ examinations/ facilities/
│   ├── finance/ notifications/ ppdb/ profile/
│   ├── reports/ students/ studentship/ system/
│   └── teachers-staff/
├── portal/         # student/ + teacher/ (portal self-service)
├── hooks/ lib/ pages/ styles/ types/
```

Setiap feature berisi: `pages/`, `components/`, `lib/`, `hooks/`, `types/`.

## Konvensi

- API base via `VITE_API_URL` (`.env`), default dev `http://127.0.0.1:8000`.
- Auth: token Bearer; guard route (`ProtectedRoute`, `RoleRoute`, `PermissionRoute`, `GuruRoute`, `StudentRoute`).
- Design system: lihat `../DESIGN.MD` (violet #7C3AED, sidebar navy, font Plus Jakarta Sans + Manrope).

## Status Testing

| Lapisan | Status | Catatan |
|---|---|---|
| Playwright smoke | 5/5 lulus | dev mode, tanpa build |
| E2E authenticated | Belum ada | butuh API hidup + seed user per role |

### Follow-up

1. **E2E authenticated** — alur login-sukses → dashboard per role (admin/guru/siswa). Tambah `webServer` kedua di `playwright.config.ts` untuk `php artisan serve`.
2. **Cakupan route** — 100+ route di router, smoke test hanya membuktikan render + guard, bukan integrasi backend.
