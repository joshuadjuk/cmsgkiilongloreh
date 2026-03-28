# Sistem Informasi Jemaat — GKII Longloreh

Aplikasi web untuk pengelolaan data jemaat, keuangan, dan konten publik Gereja Kemah Injil Indonesia (GKII) Longloreh.

---

## Fitur Utama

| Modul | Akses | Keterangan |
|---|---|---|
| **Landing Page Publik** | Semua | Jadwal ibadah, pengumuman, statistik jemaat |
| **Dashboard Jemaat** | Sekretaris, Admin | Ringkasan data, notifikasi ulang tahun |
| **Data Jemaat** | Sekretaris, Admin | CRUD jemaat, filter per kelompok doa & seksi |
| **Data Keluarga** | Sekretaris, Admin | Pengelolaan data kepala keluarga |
| **Keuangan** | Bendahara, Admin | Transaksi pemasukan/pengeluaran, laporan bulanan, grafik trend |
| **Konten Publik** | Sekretaris, Admin | Kelola jadwal ibadah & pengumuman di landing page |
| **Manajemen User** | Admin | Tambah, edit, nonaktifkan akun pengguna |
| **Ganti Password** | Semua | Melalui menu profil di header |

---

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Tailwind CSS v4
- Vite 6
- React Router v7
- ApexCharts (grafik keuangan)

**Backend**
- PHP (vanilla, tanpa framework)
- PDO untuk koneksi database
- JWT untuk autentikasi

**Database**
- MariaDB 10.11

---

## Struktur Folder

```
├── src/
│   ├── context/          # AuthContext (JWT)
│   ├── components/auth/  # ProtectedRoute
│   ├── layout/           # AppLayout, AppHeader, AppSidebar
│   ├── pages/
│   │   ├── Auth/         # LoginPage
│   │   ├── Dashboard/    # Home
│   │   ├── Jemaat/       # DataJemaat, TambahJemaat, EditJemaat, ...
│   │   ├── Keuangan/     # Dashboard, Transaksi, Laporan
│   │   ├── Admin/        # ManajemenUser, ManajemenKonten
│   │   └── LandingPage.tsx
│   └── App.tsx
│
├── api-gkii/
│   ├── config/
│   │   ├── database.php  # ⚠️ TIDAK di-commit (lihat .gitignore)
│   │   └── jwt.php
│   ├── auth.php          # Login, ganti password
│   ├── users.php         # Manajemen user (admin only)
│   ├── keuangan.php      # Transaksi & laporan keuangan
│   ├── konten.php        # CRUD jadwal & pengumuman
│   ├── landing.php       # Public API (stats, jadwal, pengumuman)
│   └── uploads/bukti/    # ⚠️ TIDAK di-commit (file upload)
│
├── sql-files/            # Script SQL untuk migrasi
├── aset-landingpage/     # Aset gambar landing page
└── public/               # Static assets (logo, gambar)
```

---

## Role Pengguna

| Role | Akses |
|---|---|
| `admin` | Semua fitur + manajemen user |
| `sekretaris` | Data jemaat + konten publik |
| `bendahara` | Modul keuangan |

---

## Instalasi Lokal

### Prasyarat
- Node.js 18+
- PHP 8.0+
- MariaDB / MySQL

### Frontend

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build untuk production
npm run build
```

### Backend

1. Salin semua file `api-gkii/` ke web server (Apache/Nginx)
2. Buat file `api-gkii/config/database.php` (lihat contoh di bawah)
3. Jalankan script SQL di folder `sql-files/`

#### Contoh `api-gkii/config/database.php`

```php
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'nama_database');
define('DB_USER', 'user_database');
define('DB_PASS', 'password_database');
```

---

## Deployment

- Frontend di-build dengan `npm run build`, hasil `dist/` diupload ke root web
- Backend PHP diupload ke folder `api-gkii/` di server
- Folder `api-gkii/uploads/` harus ada dan writable (`chmod 755`)
- Aset gambar `public/aset-landingpage/` diupload ke server

---

## Lisensi

Dikembangkan khusus untuk keperluan internal **GKII Longloreh**.
