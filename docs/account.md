# Akun & Autentikasi

Alur login, penyimpanan token, dan guard route. Sumber: `src/features/auth/`.

## Login

Halaman `/login` (`features/auth/LoginForm.tsx`). Field form: `#login` (email/username) dan `#password`, submit ke `POST /api/login` (`VITE_API_URL`).

Sukses → token disimpan, user di-set di `AuthContext`, redirect sesuai role. Gagal → toast "Login gagal", tidak crash (tercover Playwright test 5).

## Auth State

| File | Peran |
|---|---|
| `AuthContext.tsx` | Simpan user + token, sediakan `login`/`logout` |
| `context.ts` | Definisikan shape context |
| `useAuth.ts` | Hook akses auth |
| `usePermission.ts` | Hook cek permission |
| `api/` | Panggilan endpoint auth |

## Guard Route

| Guard | Fungsi |
|---|---|
| `ProtectedRoute.tsx` | Wajib login; belum auth → `/login` |
| `RoleRoute.tsx` | Batasi per role (admin/guru/siswa) |
| `PermissionRoute.tsx` | Batasi per permission |
| `GuruRoute.tsx` | Khusus portal guru |
| `StudentRoute.tsx` | Khusus portal siswa |

Contoh: `/admin/dashboard` tanpa auth → redirect `/login` (Playwright test 3). Route tak dikenal → halaman 404 (test 4).

## Konfigurasi

- `VITE_API_URL` di `.env` (default dev: `http://127.0.0.1:8000`).
- Backend harus hidup; jika mati, submit login ditangani rapi (toast error).

## Akun

Kredensial di-seed oleh backend Laravel — lihat `schoolcms-laravel/docs/account.md` (`test@example.com` / `password`).
