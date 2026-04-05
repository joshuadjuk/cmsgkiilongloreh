<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

$PHOTO_BASE = 'https://gereja.eternity.my.id/api-gkii/uploads/galeri/';
$UPLOAD_DIR = __DIR__ . '/uploads/galeri/';

if (!is_dir($UPLOAD_DIR)) { mkdir($UPLOAD_DIR, 0755, true); }

/* ─────────────────────────────────────────────────────────────
   PUBLIC GET — tanpa auth
   ───────────────────────────────────────────────────────────── */
if ($method === 'GET') {
    try {
        $rows = $db->query(
            "SELECT id, judul, foto, urutan FROM galeri ORDER BY urutan ASC, id DESC"
        )->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rows as &$r) {
            $r['foto_url'] = $PHOTO_BASE . $r['foto'];
        }

        echo json_encode(['status' => 'success', 'data' => $rows]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

/* ─────────────────────────────────────────────────────────────
   Upload helper
   ───────────────────────────────────────────────────────────── */
function uploadGaleriPhoto(string $key, string $dir): ?string {
    if (!isset($_FILES[$key]) || $_FILES[$key]['error'] === UPLOAD_ERR_NO_FILE) return null;
    if ($_FILES[$key]['error'] !== UPLOAD_ERR_OK) throw new Exception("Upload error.");
    if ($_FILES[$key]['size'] > 5 * 1024 * 1024) throw new Exception("Ukuran foto max 5 MB.");
    $info = @getimagesize($_FILES[$key]['tmp_name']);
    if (!$info || !in_array($info['mime'], ['image/jpeg','image/png','image/webp']))
        throw new Exception("Hanya JPG, PNG, WebP yang diizinkan.");
    $ext  = ['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'][$info['mime']];
    $name = uniqid('galeri_', true) . '.' . $ext;
    move_uploaded_file($_FILES[$key]['tmp_name'], $dir . $name);
    return $name;
}

function deleteGaleriPhoto(?string $filename, string $dir): void {
    if ($filename && file_exists($dir . $filename)) @unlink($dir . $filename);
}

/* ─────────────────────────────────────────────────────────────
   Protected routes (sekretaris/admin)
   ───────────────────────────────────────────────────────────── */
$user = requireAuth(['sekretaris', 'admin']);

try {
    /* POST without ?id → CREATE */
    if ($method === 'POST' && !$id) {
        $judul  = trim($_POST['judul'] ?? '');
        $urutan = (int)($_POST['urutan'] ?? 0);
        $foto   = uploadGaleriPhoto('foto', $UPLOAD_DIR);
        if (!$foto) throw new Exception("Foto wajib diunggah.");

        $db->prepare("INSERT INTO galeri (judul, foto, urutan, dibuat_oleh) VALUES (?, ?, ?, ?)")
            ->execute([$judul ?: null, $foto, $urutan, $user['sub']]);

        echo json_encode(['status' => 'success', 'message' => 'Foto berhasil ditambahkan.']);
    }

    /* POST with ?id → UPDATE urutan/judul only */
    elseif ($method === 'POST' && $id) {
        $judul  = trim($_POST['judul'] ?? '');
        $urutan = (int)($_POST['urutan'] ?? 0);

        $stmt = $db->prepare("SELECT id FROM galeri WHERE id=?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) throw new Exception("Data tidak ditemukan.");

        $db->prepare("UPDATE galeri SET judul=?, urutan=? WHERE id=?")
            ->execute([$judul ?: null, $urutan, $id]);

        echo json_encode(['status' => 'success', 'message' => 'Galeri berhasil diperbarui.']);
    }

    /* DELETE */
    elseif ($method === 'DELETE' && $id) {
        $stmt = $db->prepare("SELECT foto FROM galeri WHERE id=?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) deleteGaleriPhoto($row['foto'], $UPLOAD_DIR);
        $db->prepare("DELETE FROM galeri WHERE id=?")->execute([$id]);
        echo json_encode(['status' => 'success', 'message' => 'Foto berhasil dihapus.']);
    }

    else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Request tidak valid.']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
