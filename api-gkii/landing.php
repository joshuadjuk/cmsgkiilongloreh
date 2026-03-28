<?php
// ============================================================
// GKII Longloreh - Landing Page Public API
// GET  → publik, tanpa auth
// ============================================================

require_once 'config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method tidak diizinkan.']);
    exit();
}

// Statistik jemaat
$stmtStats = $db->query(
    "SELECT
       COUNT(*)                                              AS total_jiwa,
       COUNT(DISTINCT no_kk)                                AS total_keluarga,
       SUM(CASE WHEN status_babtis = 'Sudah Babtis' THEN 1 ELSE 0 END) AS total_baptis
     FROM jemaat"
);
$stats = $stmtStats->fetch(PDO::FETCH_ASSOC);

// Jadwal ibadah aktif
$stmtJadwal = $db->query(
    "SELECT id, nama, hari, jam, lokasi, keterangan
     FROM jadwal_ibadah WHERE is_active = 1
     ORDER BY urutan ASC, id ASC"
);
$jadwal = $stmtJadwal->fetchAll(PDO::FETCH_ASSOC);

// Pengumuman aktif (tanggal masih berlaku)
$stmtPengumuman = $db->query(
    "SELECT id, judul, isi, tanggal_mulai, tanggal_selesai
     FROM pengumuman
     WHERE is_active = 1
       AND tanggal_mulai <= CURDATE()
       AND (tanggal_selesai IS NULL OR tanggal_selesai >= CURDATE())
     ORDER BY tanggal_mulai DESC
     LIMIT 10"
);
$pengumuman = $stmtPengumuman->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'status' => 'success',
    'data'   => [
        'stats'      => [
            'total_jiwa'     => (int)$stats['total_jiwa'],
            'total_keluarga' => (int)$stats['total_keluarga'],
            'total_baptis'   => (int)$stats['total_baptis'],
        ],
        'jadwal'     => $jadwal,
        'pengumuman' => $pengumuman,
    ],
], JSON_UNESCAPED_UNICODE);
?>
