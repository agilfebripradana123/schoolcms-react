# Akun Login

## Yang Langsung Bisa Dipakai

| Role | Login | Password | Halaman |
|------|-------|----------|---------|
| Administrator | `testuser` | `password` | `/login/admin` |

Cuma ini yang di-seed (`DatabaseSeeder`). Login mode **Admin**.

## Buat Akun Lain (wajib jalanin dulu)

```powershell
cd E:\gilfp\simitra\schoolcms-laravel
php artisan serve --port=8001
```

Lalu di tab baru:

```powershell
php artisan tinker
```

### Guru
```php
$r = \App\Models\System\Role::where('name','Guru')->first();
\App\Models\System\User::create(['role_id'=>$r->id,'username'=>'guru01','name'=>'Guru Demo','email'=>'guru@schoolcms.test','password'=>bcrypt('password'),'is_active'=>true]);
```
Login `/login/guru` → `guru@schoolcms.test` / `password`

### Siswa
```php
$r = \App\Models\System\Role::where('name','Siswa')->first();
\App\Models\System\User::create(['role_id'=>$r->id,'username'=>'20240001','name'=>'Siswa Demo','email'=>'siswa@schoolcms.test','password'=>bcrypt('password'),'is_active'=>true]);
```
Login `/login` → NIS `20240001` / `password`

### Super Admin
Bukan role terpisah. `Administrator` = superuser (bypass permission middleware). Pakai akun `testuser` di atas untuk akses penuh.

## Cara Menjalankan

### Backend
```powershell
cd E:\gilfp\simitra\schoolcms-laravel
php artisan serve --port=8001
```

### Frontend
```powershell
cd E:\gilfp\simitra\schoolcms-react
npm run dev
```
Akses `http://localhost:5174`.

## Cek Gambar Settings

Kalau gambar tidak muncul di `/admin/system/settings/general`:
```powershell
cd E:\gilfp\simitra\schoolcms-laravel
Remove-Item public\storage -Recurse -Force
php artisan storage:link
php artisan config:clear
```
Verifikasi URL gambar di DB harus `http://127.0.0.1:8001/storage/settings/...`.