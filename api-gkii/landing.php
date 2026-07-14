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

$GALERI_BASE = 'https://gkiilongloreh.com/api-gkii/uploads/galeri/';

// Statistik jemaat per seksi + L/P
$stmtStats = $db->query(
    "SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN jenis_kelamin = 'Laki-Laki' THEN 1 ELSE 0 END) AS total_laki,
       SUM(CASE WHEN jenis_kelamin = 'Perempuan' THEN 1 ELSE 0 END) AS total_perempuan,
       SUM(CASE WHEN seksi = 'Sekolah Minggu' THEN 1 ELSE 0 END) AS sekolah_minggu,
       SUM(CASE WHEN seksi = 'Sekolah Minggu' AND jenis_kelamin = 'Laki-Laki' THEN 1 ELSE 0 END) AS sm_laki,
       SUM(CASE WHEN seksi = 'Sekolah Minggu' AND jenis_kelamin = 'Perempuan' THEN 1 ELSE 0 END) AS sm_perempuan,
       SUM(CASE WHEN seksi = 'Remaja' THEN 1 ELSE 0 END) AS remaja,
       SUM(CASE WHEN seksi = 'Remaja' AND jenis_kelamin = 'Laki-Laki' THEN 1 ELSE 0 END) AS remaja_laki,
       SUM(CASE WHEN seksi = 'Remaja' AND jenis_kelamin = 'Perempuan' THEN 1 ELSE 0 END) AS remaja_perempuan,
       SUM(CASE WHEN seksi = 'Pemuda' THEN 1 ELSE 0 END) AS pemuda,
       SUM(CASE WHEN seksi = 'Pemuda' AND jenis_kelamin = 'Laki-Laki' THEN 1 ELSE 0 END) AS pemuda_laki,
       SUM(CASE WHEN seksi = 'Pemuda' AND jenis_kelamin = 'Perempuan' THEN 1 ELSE 0 END) AS pemuda_perempuan,
       SUM(CASE WHEN seksi = 'Perkauan' THEN 1 ELSE 0 END) AS perkauan,
       SUM(CASE WHEN seksi = 'Perkaria' THEN 1 ELSE 0 END) AS perkaria,
       SUM(CASE WHEN seksi = 'Lansia' THEN 1 ELSE 0 END) AS lansia,
       SUM(CASE WHEN seksi = 'Lansia' AND jenis_kelamin = 'Laki-Laki' THEN 1 ELSE 0 END) AS lansia_laki,
       SUM(CASE WHEN seksi = 'Lansia' AND jenis_kelamin = 'Perempuan' THEN 1 ELSE 0 END) AS lansia_perempuan
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

// Program Kegiatan
$program = [];
try {
    $program = $db->query(
        "SELECT id, judul, deskripsi, tanggal_mulai, tanggal_selesai, lokasi, kategori
         FROM program_kegiatan
         WHERE is_active = 1 AND tanggal_mulai >= CURDATE() - INTERVAL 7 DAY
         ORDER BY tanggal_mulai ASC LIMIT 20"
    )->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) { /* tabel belum ada */ }

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
            'total'             => (int)$stats['total'],
            'total_laki'        => (int)$stats['total_laki'],
            'total_perempuan'   => (int)$stats['total_perempuan'],
            'sekolah_minggu'    => (int)$stats['sekolah_minggu'],
            'sm_laki'           => (int)$stats['sm_laki'],
            'sm_perempuan'      => (int)$stats['sm_perempuan'],
            'remaja'            => (int)$stats['remaja'],
            'remaja_laki'       => (int)$stats['remaja_laki'],
            'remaja_perempuan'  => (int)$stats['remaja_perempuan'],
            'pemuda'            => (int)$stats['pemuda'],
            'pemuda_laki'       => (int)$stats['pemuda_laki'],
            'pemuda_perempuan'  => (int)$stats['pemuda_perempuan'],
            'perkauan'          => (int)$stats['perkauan'],
            'perkaria'          => (int)$stats['perkaria'],
            'lansia'            => (int)$stats['lansia'],
            'lansia_laki'       => (int)$stats['lansia_laki'],
            'lansia_perempuan'  => (int)$stats['lansia_perempuan'],
        ],
        'jadwal'     => $jadwal,
        'pengumuman' => $pengumuman,
        'program'    => $program,
        'galeri'     => $galeri,
    ],
], JSON_UNESCAPED_UNICODE);
?>
