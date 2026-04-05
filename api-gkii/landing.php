<?php
// ============================================================
// GKII Longloreh - Landing Page Public API
// GET  → publik, tanpa auth
// ============================================================

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once 'config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method tidak diizinkan.']);
    exit();
}

$GALERI_BASE = 'https://gereja.eternity.my.id/api-gkii/uploads/galeri/';

// Statistik jemaat per seksi
$stmtStats = $db->query(
    "SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN seksi = 'Sekolah Minggu' THEN 1 ELSE 0 END) AS sekolah_minggu,
       SUM(CASE WHEN seksi = 'Remaja'         THEN 1 ELSE 0 END) AS remaja,
       SUM(CASE WHEN seksi = 'Pemuda'         THEN 1 ELSE 0 END) AS pemuda,
       SUM(CASE WHEN seksi = 'Perkauan'       THEN 1 ELSE 0 END) AS perkauan,
       SUM(CASE WHEN seksi = 'Perkaria'       THEN 1 ELSE 0 END) AS perkaria,
       SUM(CASE WHEN seksi = 'Lansia'         THEN 1 ELSE 0 END) AS lansia
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

// Galeri foto
$galeri = [];
try {
    $stmtGaleri = $db->query(
        "SELECT id, judul, foto FROM galeri ORDER BY urutan ASC, id DESC LIMIT 60"
    );
    $galeriRows = $stmtGaleri->fetchAll(PDO::FETCH_ASSOC);
    $galeri = array_map(function($row) use ($GALERI_BASE) {
        return [
            'id'       => $row['id'],
            'judul'    => $row['judul'],
            'foto_url' => $GALERI_BASE . $row['foto'],
        ];
    }, $galeriRows);
} catch (Exception $e) {
    // tabel galeri belum ada, lanjut tanpa galeri
}

echo json_encode([
    'status' => 'success',
    'data'   => [
        'stats' => [
            'total'          => (int)$stats['total'],
            'sekolah_minggu' => (int)$stats['sekolah_minggu'],
            'remaja'         => (int)$stats['remaja'],
            'pemuda'         => (int)$stats['pemuda'],
            'perkauan'       => (int)$stats['perkauan'],
            'perkaria'       => (int)$stats['perkaria'],
            'lansia'         => (int)$stats['lansia'],
        ],
        'jadwal'     => $jadwal,
        'pengumuman' => $pengumuman,
        'galeri'     => $galeri,
    ],
], JSON_UNESCAPED_UNICODE);
?>
