# Project Architecture — GKII Longloreh Church Management System

> Dokumen ini adalah peta arsitektur aplikasi untuk acuan pengembangan lebih lanjut.
> Dibuat: 2026-03-29

---

## 1. Overview

**Sistem Informasi Manajemen Jemaat** untuk gereja GKII Longloreh.

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19 + TypeScript + Tailwind CSS v4 + Vite 6 |
| Backend | PHP (vanilla) + PDO |
| Database | MySQL (`gkiilongloreh`) |
| Routing | React Router 7 |
| State | Context API (Theme, Sidebar) |
| Charts | ApexCharts + FullCalendar |

---

## 2. Struktur Folder

```
/
├── src/
│   ├── main.tsx                  # Entry point (mount React ke #root)
│   ├── App.tsx                   # Root Router + semua route definitions
│   ├── index.css                 # Global styles + Tailwind theme variables
│   ├── components/               # Komponen reusable
│   │   ├── auth/                 # SignInForm, SignUpForm
│   │   ├── charts/               # BarChartOne, LineChartOne
│   │   ├── common/               # PageBreadcrumb, ThemeToggleButton, PageMeta
│   │   ├── form/                 # Input, Select, DatePicker, Checkbox, dll
│   │   ├── header/               # Header component
│   │   ├── tables/               # Table components
│   │   ├── ui/                   # Button, Modal, Alert, Badge, Avatar, Dropdown
│   │   └── UserProfile/          # User profile komponen
│   ├── context/
│   │   ├── ThemeContext.tsx      # Dark/light mode (persist ke localStorage)
│   │   └── SidebarContext.tsx    # Sidebar expand/collapse + mobile state
│   ├── hooks/
│   │   ├── useGoBack.ts          # Navigate back dengan fallback ke home
│   │   └── useModal.ts           # Modal open/close state
│   ├── layout/
│   │   ├── AppLayout.tsx         # Wrapper utama (Sidebar + Header + Outlet)
│   │   ├── AppSidebar.tsx        # Navigasi sidebar dengan submenu
│   │   ├── AppHeader.tsx         # Top bar
│   │   ├── Backdrop.tsx          # Mobile sidebar backdrop
│   │   └── SidebarWidget.tsx     # Widget di sidebar
│   ├── pages/
│   │   ├── Dashboard/Home.tsx    # Dashboard analytics utama
│   │   ├── Jemaat/
│   │   │   ├── DataJemaat.tsx    # Daftar semua anggota (list + search + pagination)
│   │   │   ├── TambahJemaat.tsx  # Form tambah anggota baru
│   │   │   ├── EditJemaat.tsx    # Form edit anggota
│   │   │   ├── DataKeluarga.tsx  # Tampilan per KK (Kartu Keluarga)
│   │   │   ├── DataKelompokDoa.tsx # Filter per kelompok doa
│   │   │   └── DataSeksi.tsx     # Filter per seksi
│   │   ├── OtherPage/NotFound.tsx
│   │   └── Calendar.tsx          # Kalender ulang tahun
│   └── icons/                    # SVG icon components
├── api-gkii/
│   ├── jemaat.php               # REST API (semua CRUD via satu file)
│   └── config/database.php      # Koneksi PDO ke MySQL
├── public/                       # Static assets
├── index.html                    # HTML root
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Routing (App.tsx)

| Path | Komponen | Keterangan |
|------|----------|------------|
| `/` | `Home` | Dashboard utama |
| `/data-jemaat` | `DataJemaat` | Daftar semua anggota |
| `/tambah-jemaat` | `TambahJemaat` | Form tambah anggota |
| `/edit-jemaat/:id` | `EditJemaat` | Form edit anggota by ID |
| `/data-keluarga` | `DataKeluarga` | Tampilan per KK |
| `/kelompok-doa/:kelompok` | `DataKelompokDoa` | Filter by kelompok doa |
| `/seksi/:seksiParam` | `DataSeksi` | Filter by seksi |
| `/calendar` | `Calendar` | Kalender |
| `*` | `NotFound` | 404 |

**Semua route dibungkus `AppLayout`** (sidebar + header).

---

## 4. Data Model — Database Schema Aktual

> Sumber: `sql-files/sql_gereja_local.sql` — MariaDB 10.11, PHP 8.3
> Server: `localhost`, DB: `sql_gereja_local`, User: `sql_gereja_local`

### Tabel `jemaat` (AUTO_INCREMENT = 162)

```sql
CREATE TABLE `jemaat` (
  `id`                 int(11)      NOT NULL AUTO_INCREMENT,
  `no_kk`              varchar(20)  NOT NULL,
  `nama_lengkap`       varchar(100) NOT NULL,
  `hubungan_keluarga`  enum('Kepala Keluarga','Istri','Anak','Famili Lain') DEFAULT 'Kepala Keluarga',
  `tempat_lahir`       varchar(50)  DEFAULT NULL,
  `tanggal_lahir`      date         DEFAULT NULL,
  `jenis_kelamin`      enum('Laki-Laki','Perempuan') DEFAULT NULL,
  `status_pernikahan`  enum('Sudah Menikah','Belum Menikah','Janda','Duda') DEFAULT NULL,
  `tanggal_perkawinan` date         DEFAULT NULL,
  `status_babtis`      enum('Sudah Babtis','Belum Babtis') DEFAULT NULL,
  `anggota_jemaat`     enum('Tetap','Simpatisan') DEFAULT 'Tetap',
  `seksi`              enum('Sekolah Minggu','Remaja','Perkauan','Perkaria','Lansia','Pemuda') DEFAULT NULL,
  `alamat`             text         DEFAULT NULL,
  `kelompok_doa`       enum('Kalvari','Efesus','Filipi','Imanuel','Galatia') DEFAULT 'Kalvari',
  `created_at`         timestamp    NULL DEFAULT current_timestamp()
)
```

### Tabel `users` (AUTO_INCREMENT = 4)

```sql
CREATE TABLE `users` (
  `id`           int(11)      NOT NULL AUTO_INCREMENT,
  `username`     varchar(50)  NOT NULL UNIQUE,
  `password`     varchar(255) NOT NULL,           -- bcrypt hash
  `nama_lengkap` varchar(100) NOT NULL,
  `role`         enum('admin','bendahara','sekretaris') NOT NULL DEFAULT 'sekretaris',
  `is_active`    tinyint(1)   NOT NULL DEFAULT 1,
  `created_at`   timestamp    NULL DEFAULT current_timestamp(),
  `updated_at`   timestamp    NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
)
```

**User default yang sudah ada** (password: `gkii2024`):
| id | username | role |
|----|----------|------|
| 1 | sekretaris | sekretaris |
| 2 | admin | admin |
| 3 | bendahara | bendahara |

### TypeScript Interface

```typescript
interface Jemaat {
  id: number
  no_kk: string                 // varchar(20)
  nama_lengkap: string          // varchar(100)
  hubungan_keluarga: 'Kepala Keluarga' | 'Istri' | 'Anak' | 'Famili Lain'
  tempat_lahir: string | null
  tanggal_lahir: string | null  // YYYY-MM-DD
  jenis_kelamin: 'Laki-Laki' | 'Perempuan' | null
  status_pernikahan: 'Sudah Menikah' | 'Belum Menikah' | 'Janda' | 'Duda' | null
  tanggal_perkawinan: string | null
  status_babtis: 'Sudah Babtis' | 'Belum Babtis' | null
  anggota_jemaat: 'Tetap' | 'Simpatisan'
  seksi: 'Sekolah Minggu' | 'Remaja' | 'Perkauan' | 'Perkaria' | 'Lansia' | 'Pemuda' | null
  alamat: string | null         // text
  kelompok_doa: 'Kalvari' | 'Efesus' | 'Filipi' | 'Imanuel' | 'Galatia'
  created_at?: string
}
```

---

## 5. API — Backend PHP

**Base URL:** `https://gereja.eternity.my.id/api-gkii/jemaat.php`

| Method | Query Params | Body | Fungsi |
|--------|-------------|------|--------|
| GET | — | — | Ambil semua anggota |
| GET | `?id={id}` | — | Ambil satu anggota |
| POST | — | JSON Jemaat | Tambah anggota baru |
| PUT | `?id={id}` | JSON Jemaat | Update anggota |
| DELETE | `?id={id}` | — | Hapus anggota |

**Response format:**
```json
{
  "status": "success" | "error",
  "message": "...",
  "data": null | {} | []
}
```

**CORS:** Enabled `*` (semua origin).
**Database:** MySQL di localhost, DB `gkiilongloreh`, tabel `jemaat`, koneksi via PDO.

---

## 6. Alur Data (Data Flow)

### Tampil Data (Read)
```
Page mount
  → useEffect()
    → fetch(API_URL)             // GET jemaat.php
      → setMembers(data)         // update React state
        → render tabel/list
```

### Tambah Anggota (Create)
```
TambahJemaat form submit
  → validasi (no_kk, nama_lengkap wajib)
  → fetch(API_URL, { method: 'POST', body: JSON })
    → success → navigate('/data-jemaat')
    → error   → tampilkan pesan error
```

### Edit Anggota (Update)
```
EditJemaat mount
  → fetch(API_URL?id=X)          // load data existing
    → isi form dengan data lama

Form submit
  → fetch(API_URL?id=X, { method: 'PUT', body: JSON })
    → success → navigate('/data-jemaat')
```

### Hapus Anggota (Delete)
```
Tombol delete diklik
  → confirm dialog
    → fetch(API_URL?id=X, { method: 'DELETE' })
      → success → refresh list (fetchMembers)
```

### Filter Dinamis (DataKelompokDoa / DataSeksi)
```
URL: /kelompok-doa/:kelompok atau /seksi/:seksiParam
  → useParams() ambil parameter
  → fetch semua data
    → filter client-side berdasarkan parameter
      → render hasil filter
```

---

## 7. State Management

```
ThemeProvider (localStorage)
  └── dark/light mode → class "dark" pada <html>

SidebarProvider
  ├── isExpanded        → sidebar expand/collapse (desktop)
  ├── isMobileOpen      → sidebar drawer (mobile)
  ├── isHovered         → hover state
  └── openSubmenu       → submenu aktif

Local state per page
  ├── members[]         → data dari API
  ├── searchTerm        → filter input
  ├── currentPage       → pagination
  └── isLoading/error   → async state
```

---

## 8. Layout Structure

```
<ThemeProvider>
  <AppWrapper>          ← helmet meta tags
    <Router>
      <AppLayout>
        ├── <SidebarProvider>
        │     ├── <AppSidebar>   ← navigasi kiri
        │     └── <AppHeader>    ← top bar
        └── <Outlet>             ← konten halaman aktif
      </AppLayout>
    </Router>
  </AppWrapper>
</ThemeProvider>
```

---

## 9. Dashboard Analytics (Home.tsx)

Kalkulasi dilakukan **client-side** dari data API:

- Total anggota, KK, kelompok doa, seksi
- Distribusi gender per seksi dan per kelompok doa
- Daftar ulang tahun bulan ini
- Daftar anniversary perkawinan bulan ini
- Distribusi usia (kelompok umur)
- Tren pertumbuhan anggota 6 bulan terakhir
- Status pernikahan, status babtis, jenis anggota

---

## 10. Nilai ENUM Aktual (dari DB)

| Field | Nilai Valid |
|-------|-------------|
| `hubungan_keluarga` | `Kepala Keluarga`, `Istri`, `Anak`, `Famili Lain` |
| `jenis_kelamin` | `Laki-Laki`, `Perempuan` |
| `status_pernikahan` | `Sudah Menikah`, `Belum Menikah`, `Janda`, `Duda` |
| `status_babtis` | `Sudah Babtis`, `Belum Babtis` |
| `anggota_jemaat` | `Tetap`, `Simpatisan` |
| `seksi` | `Sekolah Minggu`, `Remaja`, `Perkauan`, `Perkaria`, `Lansia`, `Pemuda` |
| `kelompok_doa` | `Kalvari`, `Efesus`, `Filipi`, `Imanuel`, `Galatia` |
| `role` (users) | `admin`, `bendahara`, `sekretaris` |

---

## 11. URL Slug → DB Value Mapping

**DataSeksi** (`/seksi/:seksiParam`):
```
sekolah-minggu → "Sekolah Minggu"
remaja         → "Remaja"
pemuda         → "Pemuda"
perkaria       → "Perkaria"
perkauan       → "Perkauan"
lansia         → "Lansia"
```

**DataKelompokDoa** (`/kelompok-doa/:kelompok`):
```
kalvari  → "Kalvari"
efesus   → "Efesus"
filipi   → "Filipi"
imanuel  → "Imanuel"
galatia  → "Galatia"
```

---

## 12. Build & Dev

```bash
npm run dev       # Dev server (Vite HMR)
npm run build     # tsc -b && vite build
npm run preview   # Preview production build
npm run lint      # ESLint
```

**Vite plugins:** `@vitejs/plugin-react` + `vite-plugin-svgr`
**CSS:** PostCSS + `@tailwindcss/postcss` v4
**TypeScript:** strict mode, target ES2020
