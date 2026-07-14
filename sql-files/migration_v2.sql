-- ============================================================
-- GKII Longloreh – Migration v2
-- Jalankan satu kali di server produksi
-- ============================================================

-- 1. Tambah kolom tipe ke gembala_jemaat
ALTER TABLE `gembala_jemaat`
  ADD COLUMN `tipe` ENUM('aktif','senior','mantan') NOT NULL DEFAULT 'aktif'
  AFTER `nama`;

-- Set tipe berdasarkan data lama: masih menjabat = aktif, selesai = mantan
UPDATE `gembala_jemaat` SET `tipe` = CASE
  WHEN `tahun_selesai` IS NULL THEN 'aktif'
  ELSE 'mantan'
END;

-- 2. Tambah kolom parent_id ke bpj_periode (untuk struktur tree)
ALTER TABLE `bpj_periode`
  ADD COLUMN `parent_id` INT DEFAULT NULL AFTER `id`,
  ADD CONSTRAINT `fk_bpj_parent` FOREIGN KEY (`parent_id`) REFERENCES `bpj_periode`(`id`) ON DELETE SET NULL;

-- 3. Tabel Program Kegiatan
CREATE TABLE IF NOT EXISTS `program_kegiatan` (
  `id`              INT AUTO_INCREMENT PRIMARY KEY,
  `judul`           VARCHAR(200) NOT NULL,
  `deskripsi`       TEXT DEFAULT NULL,
  `tanggal_mulai`   DATE NOT NULL,
  `tanggal_selesai` DATE DEFAULT NULL,
  `lokasi`          VARCHAR(200) DEFAULT NULL,
  `kategori`        VARCHAR(100) DEFAULT NULL,
  `is_active`       TINYINT(1) NOT NULL DEFAULT 1,
  `dibuat_oleh`     INT DEFAULT NULL,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
