# Akun

| Role | Login | Password | URL |
|------|-------|----------|-----|
| Administrator | `testuser` / `test@example.com` | `password` | `/login/admin` |
| Guru | `guru@schoolcms.test` | `password` | `/login/guru` |
| Siswa | `20240001` (NIS) | `password` | `/login` |
| Guru (QA fixture) | `qa.teacher.crossportal@schoolcms.test` | `qa.cross.portal.2026` | `/login/guru` |
| Siswa (QA fixture) | `QA-CROSS-PORTAL-ST` | `qa.cross.portal.2026` | `/login` |

Hanya akun Administrator pertama yang di-seed (`php artisan migrate --seed`). Sisip `test@example.com` = `DatabaseSeeder.php`.

Role `Super Admin` tidak di-seed. `Administrator` sudah berperan superuser (bypass `permission` middleware), jadi pakai akun Administrator untuk akses penuh.

Baris QA fixture butuh `php artisan db:seed --class=AcademicCrossPortalFixtureSeeder`.

Cara buat akun Guru / Siswa baru: login Administrator, buka `/admin/system/users`, tambah user dengan role `Guru` (login pakai email) atau `Siswa` (login pakai NIS).