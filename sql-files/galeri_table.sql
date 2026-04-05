CREATE TABLE IF NOT EXISTS `galeri` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `judul`       VARCHAR(255) DEFAULT NULL,
  `foto`        VARCHAR(255) NOT NULL,
  `urutan`      INT          DEFAULT 0,
  `dibuat_oleh` INT          DEFAULT NULL,
  `created_at`  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
