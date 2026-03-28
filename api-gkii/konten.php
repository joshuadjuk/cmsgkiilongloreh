<?php
// ============================================================
// GKII Longloreh - Konten Landing Page (Auth Required)
// Akses: sekretaris & admin
// resource=jadwal    → kelola jadwal_ibadah
// resource=pengumuman → kelola pengumuman
// ============================================================

require_once 'config/database.php';
require_once 'config/jwt.php';

$authUser = requireAuth(['sekretaris', 'admin']);

$method   = $_SERVER['REQUEST_METHOD'];
$resource = $_GET['resource'] ?? '';
$id       = isset($_GET['id']) ? (int)$_GET['id'] : null;

function sendResponse(int $status, string $message, $data = null): void {
    http_response_code($status);
    echo json_encode([
        'status'  => ($status >= 200 && $status < 300) ? 'success' : 'error',
        'message' => $message,
        'data'    => $data,
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// ---- JADWAL IBADAH ----
if ($resource === 'jadwal') {

    switch ($method) {

        case 'GET':
            $stmt = $db->query("SELECT * FROM jadwal_ibadah ORDER BY urutan ASC, id ASC");
            sendResponse(200, 'OK', $stmt->fetchAll(PDO::FETCH_ASSOC));

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $nama  = trim($input['nama']  ?? '');
            $hari  = trim($input['hari']  ?? '');
            $jam   = trim($input['jam']   ?? '');
            if (!$nama || !$hari || !$jam) sendResponse(400, 'Nama, hari, dan jam wajib diisi.');
            $stmt = $db->prepare(
                "INSERT INTO jadwal_ibadah (nama, hari, jam, lokasi, keterangan, urutan, is_active, dibuat_oleh)
                 VALUES (:nama,:hari,:jam,:lokasi,:ket,:urutan,:aktif,:by)"
            );
            $stmt->execute([
                ':nama'   => $nama,
                ':hari'   => $hari,
                ':jam'    => $jam,
                ':lokasi' => trim($input['lokasi'] ?? '') ?: null,
                ':ket'    => trim($input['keterangan'] ?? '') ?: null,
                ':urutan' => (int)($input['urutan'] ?? 0),
                ':aktif'  => isset($input['is_active']) ? (int)$input['is_active'] : 1,
                ':by'     => $authUser['sub'],
            ]);
            sendResponse(201, 'Jadwal berhasil ditambahkan.', ['id' => (int)$db->lastInsertId()]);

        case 'PUT':
            if (!$id) sendResponse(400, 'ID diperlukan.');
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $nama  = trim($input['nama'] ?? '');
            $hari  = trim($input['hari'] ?? '');
            $jam   = trim($input['jam']  ?? '');
            if (!$nama || !$hari || !$jam) sendResponse(400, 'Nama, hari, dan jam wajib diisi.');
            $db->prepare(
                "UPDATE jadwal_ibadah SET nama=:nama, hari=:hari, jam=:jam, lokasi=:lokasi,
                 keterangan=:ket, urutan=:urutan, is_active=:aktif WHERE id=:id"
            )->execute([
                ':nama'   => $nama,
                ':hari'   => $hari,
                ':jam'    => $jam,
                ':lokasi' => trim($input['lokasi'] ?? '') ?: null,
                ':ket'    => trim($input['keterangan'] ?? '') ?: null,
                ':urutan' => (int)($input['urutan'] ?? 0),
                ':aktif'  => isset($input['is_active']) ? (int)$input['is_active'] : 1,
                ':id'     => $id,
            ]);
            sendResponse(200, 'Jadwal berhasil diupdate.');

        case 'DELETE':
            if (!$id) sendResponse(400, 'ID diperlukan.');
            $db->prepare("DELETE FROM jadwal_ibadah WHERE id=:id")->execute([':id' => $id]);
            sendResponse(200, 'Jadwal berhasil dihapus.');

        default:
            sendResponse(405, 'Method tidak diizinkan.');
    }
}

// ---- PENGUMUMAN ----
elseif ($resource === 'pengumuman') {

    switch ($method) {

        case 'GET':
            $stmt = $db->query(
                "SELECT p.*, u.nama_lengkap AS dibuat_oleh_nama
                 FROM pengumuman p LEFT JOIN users u ON u.id = p.dibuat_oleh
                 ORDER BY p.tanggal_mulai DESC"
            );
            sendResponse(200, 'OK', $stmt->fetchAll(PDO::FETCH_ASSOC));

        case 'POST':
            $input  = json_decode(file_get_contents('php://input'), true) ?? [];
            $judul  = trim($input['judul'] ?? '');
            $isi    = trim($input['isi']   ?? '');
            $mulai  = trim($input['tanggal_mulai'] ?? '');
            if (!$judul || !$isi || !$mulai) sendResponse(400, 'Judul, isi, dan tanggal mulai wajib diisi.');
            $stmt = $db->prepare(
                "INSERT INTO pengumuman (judul, isi, tanggal_mulai, tanggal_selesai, is_active, dibuat_oleh)
                 VALUES (:judul,:isi,:mulai,:selesai,:aktif,:by)"
            );
            $stmt->execute([
                ':judul'   => $judul,
                ':isi'     => $isi,
                ':mulai'   => $mulai,
                ':selesai' => trim($input['tanggal_selesai'] ?? '') ?: null,
                ':aktif'   => isset($input['is_active']) ? (int)$input['is_active'] : 1,
                ':by'      => $authUser['sub'],
            ]);
            sendResponse(201, 'Pengumuman berhasil ditambahkan.', ['id' => (int)$db->lastInsertId()]);

        case 'PUT':
            if (!$id) sendResponse(400, 'ID diperlukan.');
            $input  = json_decode(file_get_contents('php://input'), true) ?? [];
            $judul  = trim($input['judul'] ?? '');
            $isi    = trim($input['isi']   ?? '');
            $mulai  = trim($input['tanggal_mulai'] ?? '');
            if (!$judul || !$isi || !$mulai) sendResponse(400, 'Judul, isi, dan tanggal mulai wajib diisi.');
            $db->prepare(
                "UPDATE pengumuman SET judul=:judul, isi=:isi, tanggal_mulai=:mulai,
                 tanggal_selesai=:selesai, is_active=:aktif WHERE id=:id"
            )->execute([
                ':judul'   => $judul,
                ':isi'     => $isi,
                ':mulai'   => $mulai,
                ':selesai' => trim($input['tanggal_selesai'] ?? '') ?: null,
                ':aktif'   => isset($input['is_active']) ? (int)$input['is_active'] : 1,
                ':id'      => $id,
            ]);
            sendResponse(200, 'Pengumuman berhasil diupdate.');

        case 'DELETE':
            if (!$id) sendResponse(400, 'ID diperlukan.');
            $db->prepare("DELETE FROM pengumuman WHERE id=:id")->execute([':id' => $id]);
            sendResponse(200, 'Pengumuman berhasil dihapus.');

        default:
            sendResponse(405, 'Method tidak diizinkan.');
    }
}

else {
    sendResponse(400, 'Parameter resource tidak valid. Gunakan ?resource=jadwal atau ?resource=pengumuman');
}
?>
