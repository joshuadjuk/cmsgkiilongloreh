-- ============================================================
-- Tabel BPJ Periode
-- ============================================================
CREATE TABLE IF NOT EXISTS `bpj_periode` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `nama`        VARCHAR(100) NOT NULL,
  `jabatan`     VARCHAR(100) DEFAULT NULL,
  `foto`        VARCHAR(255) DEFAULT NULL,
  `periode`     VARCHAR(50)  DEFAULT NULL,   -- misal: "2020-2024"
  `urutan`      INT          DEFAULT 0,
  `is_active`   TINYINT(1)   DEFAULT 1,
  `dibuat_oleh` INT          DEFAULT NULL,
  `created_at`  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Tabel Gembala Jemaat
-- ============================================================
CREATE TABLE IF NOT EXISTS `gembala_jemaat` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `nama`          VARCHAR(100) NOT NULL,
  `foto`          VARCHAR(255) DEFAULT NULL,
  `tahun_mulai`   VARCHAR(4)   NOT NULL,
  `tahun_selesai` VARCHAR(4)   DEFAULT NULL,  -- NULL = masih aktif/menjabat
  `urutan`        INT          DEFAULT 0,
  `created_at`    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Contoh data
-- ============================================================
INSERT INTO `gembala_jemaat` (nama, tahun_mulai, tahun_selesai, urutan) VALUES
('Pdt. Contoh Pertama', '2005', '2012', 1),
('Pdt. Contoh Kedua',   '2013', '2020', 2),
('Pdt. Contoh Ketiga',  '2021', NULL,   3);

INSERT INTO `bpj_periode` (nama, jabatan, periode, urutan, is_active) VALUES
('Nama Ketua BPJ',    'Ketua',      '2021-2025', 1, 1),
('Nama Sekretaris',   'Sekretaris', '2021-2025', 2, 1),
('Nama Bendahara',    'Bendahara',  '2021-2025', 3, 1),
('Nama Anggota 1',    'Anggota',    '2021-2025', 4, 1),
('Nama Anggota 2',    'Anggota',    '2021-2025', 5, 1);
