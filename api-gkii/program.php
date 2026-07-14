<?php
// ============================================================
// GKII Longloreh – Program Kegiatan API
// GET (public) – daftar program aktif
// POST / DELETE – butuh auth (sekretaris / admin)
// ============================================================

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

/* ─────────────────────────────────────────────────────────────
   PUBLIC GET
   ───────────────────────────────────────────────────────────── */
if ($method === 'GET') {
    try {
        $rows = $db->query(
            "SELECT id, judul, deskripsi, tanggal_mulai, tanggal_selesai, lokasi, kategori
             FROM program_kegiatan
             WHERE is_active = 1
             ORDER BY tanggal_mulai ASC"
        )->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['status' => 'success', 'data' => $rows], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

/* ─────────────────────────────────────────────────────────────
   Protected routes
   ───────────────────────────────────────────────────────────── */
$user = requireAuth(['sekretaris', 'admin']);

try {
    /* ── Admin GET (semua, termasuk nonaktif) ─────────────── */
    if ($method === 'GET') {
        $rows = $db->query(
            "SELECT id, judul, deskripsi, tanggal_mulai, tanggal_selesai, lokasi, kategori, is_active
             FROM program_kegiatan ORDER BY tanggal_mulai DESC"
        )->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'data' => $rows], JSON_UNESCAPED_UNICODE);
        exit;
    }

    /* ── CREATE ───────────────────────────────────────────── */
    if ($method === 'POST' && !$id) {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $judul   = trim($data['judul']           ?? '');
        $desk    = trim($data['deskripsi']        ?? '');
        $tMulai  = trim($data['tanggal_mulai']    ?? '');
        $tSeles  = trim($data['tanggal_selesai']  ?? '');
        $lokasi  = trim($data['lokasi']           ?? '');
        $kat     = trim($data['kategori']         ?? '');
        $aktif   = isset($data['is_active']) ? (int)$data['is_active'] : 1;

        if (!$judul)  throw new Exception('Judul wajib diisi.');
        if (!$tMulai) throw new Exception('Tanggal mulai wajib diisi.');

        $db->prepare(
            "INSERT INTO program_kegiatan (judul, deskripsi, tanggal_mulai, tanggal_selesai, lokasi, kategori, is_active, dibuat_oleh)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )->execute([$judul, $desk ?: null, $tMulai, $tSeles ?: null, $lokasi ?: null, $kat ?: null, $aktif, $user['sub']]);

        echo json_encode(['status' => 'success', 'message' => 'Program berhasil ditambahkan.']);
        exit;
    }

    /* ── UPDATE ───────────────────────────────────────────── */
    if ($method === 'POST' && $id) {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $judul  = trim($data['judul']           ?? '');
        $desk   = trim($data['deskripsi']        ?? '');
        $tMulai = trim($data['tanggal_mulai']    ?? '');
        $tSeles = trim($data['tanggal_selesai']  ?? '');
        $lokasi = trim($data['lokasi']           ?? '');
        $kat    = trim($data['kategori']         ?? '');
        $aktif  = isset($data['is_active']) ? (int)$data['is_active'] : 1;

        if (!$judul)  throw new Exception('Judul wajib diisi.');
        if (!$tMulai) throw new Exception('Tanggal mulai wajib diisi.');

        $db->prepare(
            "UPDATE program_kegiatan
             SET judul=?, deskripsi=?, tanggal_mulai=?, tanggal_selesai=?, lokasi=?, kategori=?, is_active=?
             WHERE id=?"
        )->execute([$judul, $desk ?: null, $tMulai, $tSeles ?: null, $lokasi ?: null, $kat ?: null, $aktif, $id]);

        echo json_encode(['status' => 'success', 'message' => 'Program berhasil diperbarui.']);
        exit;
    }

    /* ── DELETE ───────────────────────────────────────────── */
    if ($method === 'DELETE' && $id) {
        $db->prepare("DELETE FROM program_kegiatan WHERE id=?")->execute([$id]);
        echo json_encode(['status' => 'success', 'message' => 'Program berhasil dihapus.']);
        exit;
    }

    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method tidak diizinkan.']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
