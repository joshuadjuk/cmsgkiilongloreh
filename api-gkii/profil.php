<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/jwt.php';

$method     = $_SERVER['REQUEST_METHOD'];
$resource   = $_GET['resource'] ?? null;
$id         = isset($_GET['id']) ? (int)$_GET['id'] : null;

$PHOTO_BASE = 'https://gereja.eternity.my.id/api-gkii/uploads/profil/';
$UPLOAD_DIR = __DIR__ . '/uploads/profil/';

if (!is_dir($UPLOAD_DIR)) { mkdir($UPLOAD_DIR, 0755, true); }

/* ─────────────────────────────────────────────────────────────
   PUBLIC GET — tidak perlu auth
   ───────────────────────────────────────────────────────────── */
if ($method === 'GET' && !$resource) {
    try {
        $bpj = $db->query(
            "SELECT id, nama, jabatan, foto, periode FROM bpj_periode WHERE is_active=1 ORDER BY urutan, id"
        )->fetchAll(PDO::FETCH_ASSOC);

        $gembala = $db->query(
            "SELECT id, nama, foto, tahun_mulai, tahun_selesai FROM gembala_jemaat ORDER BY tahun_mulai DESC"
        )->fetchAll(PDO::FETCH_ASSOC);

        foreach ($bpj    as &$b) { $b['foto_url'] = $b['foto'] ? $PHOTO_BASE.$b['foto'] : null; unset($b['foto']); }
        foreach ($gembala as &$g) { $g['foto_url'] = $g['foto'] ? $PHOTO_BASE.$g['foto'] : null; unset($g['foto']); }

        echo json_encode(['status' => 'success', 'data' => compact('bpj', 'gembala')]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

/* ─────────────────────────────────────────────────────────────
   Upload & delete photo helper
   ───────────────────────────────────────────────────────────── */
function uploadPhoto(string $key, string $dir): ?string {
    if (!isset($_FILES[$key]) || $_FILES[$key]['error'] === UPLOAD_ERR_NO_FILE) return null;
    if ($_FILES[$key]['error'] !== UPLOAD_ERR_OK) throw new Exception("Upload error.");
    if ($_FILES[$key]['size'] > 3 * 1024 * 1024) throw new Exception("Ukuran foto max 3 MB.");
    $info = @getimagesize($_FILES[$key]['tmp_name']);
    if (!$info || !in_array($info['mime'], ['image/jpeg','image/png','image/webp']))
        throw new Exception("Hanya JPG, PNG, WebP yang diizinkan.");
    $ext = ['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'][$info['mime']];
    $name = uniqid('pfoto_', true) . '.' . $ext;
    move_uploaded_file($_FILES[$key]['tmp_name'], $dir . $name);
    return $name;
}

function deletePhoto(?string $filename, string $dir): void {
    if ($filename && file_exists($dir . $filename)) @unlink($dir . $filename);
}

/* ─────────────────────────────────────────────────────────────
   Protected routes
   NOTE: POST dipakai untuk create DAN update (PUT tidak parse
   multipart/form-data di PHP). Bedain lewat ada/tidaknya ?id=
   ───────────────────────────────────────────────────────────── */
$user = requireAuth(['sekretaris', 'admin']);

try {
    /* ══ BPJ ══════════════════════════════════════════════════ */
    if ($resource === 'bpj') {

        if ($method === 'GET') {
            $rows = $db->query("SELECT id, nama, jabatan, foto, periode, urutan, is_active FROM bpj_periode ORDER BY urutan, id")->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as &$r) { $r['foto_url'] = $r['foto'] ? $PHOTO_BASE.$r['foto'] : null; }
            echo json_encode(['status'=>'success','data'=>$rows]);
        }

        elseif ($method === 'POST' && !$id) {
            // CREATE
            $nama    = trim($_POST['nama']    ?? '');
            $jabatan = trim($_POST['jabatan'] ?? '');
            $periode = trim($_POST['periode'] ?? '');
            $urutan  = (int)($_POST['urutan'] ?? 0);
            $aktif   = (int)($_POST['is_active'] ?? 1);
            if (!$nama) throw new Exception("Nama wajib diisi.");
            $foto = uploadPhoto('foto', $UPLOAD_DIR);
            $db->prepare("INSERT INTO bpj_periode (nama,jabatan,foto,periode,urutan,is_active,dibuat_oleh) VALUES(?,?,?,?,?,?,?)")
                ->execute([$nama, $jabatan ?: null, $foto, $periode ?: null, $urutan, $aktif, $user['sub']]);
            echo json_encode(['status'=>'success','message'=>'BPJ berhasil ditambahkan.']);
        }

        elseif ($method === 'POST' && $id) {
            // UPDATE
            $existing = $db->prepare("SELECT foto FROM bpj_periode WHERE id=?");
            $existing->execute([$id]);
            $old = $existing->fetch(PDO::FETCH_ASSOC);
            if (!$old) throw new Exception("Data tidak ditemukan.");

            $nama      = trim($_POST['nama']    ?? '');
            $jabatan   = trim($_POST['jabatan'] ?? '');
            $periode   = trim($_POST['periode'] ?? '');
            $urutan    = (int)($_POST['urutan'] ?? 0);
            $aktif     = (int)($_POST['is_active'] ?? 1);
            $hapusFoto = ($_POST['hapus_foto'] ?? '') === '1';
            if (!$nama) throw new Exception("Nama wajib diisi.");

            $fotoName = $old['foto'];
            $newFoto  = uploadPhoto('foto', $UPLOAD_DIR);
            if ($newFoto) { deletePhoto($fotoName, $UPLOAD_DIR); $fotoName = $newFoto; }
            elseif ($hapusFoto) { deletePhoto($fotoName, $UPLOAD_DIR); $fotoName = null; }

            $db->prepare("UPDATE bpj_periode SET nama=?,jabatan=?,foto=?,periode=?,urutan=?,is_active=? WHERE id=?")
                ->execute([$nama, $jabatan ?: null, $fotoName, $periode ?: null, $urutan, $aktif, $id]);
            echo json_encode(['status'=>'success','message'=>'BPJ berhasil diperbarui.']);
        }

        elseif ($method === 'DELETE' && $id) {
            $r = $db->prepare("SELECT foto FROM bpj_periode WHERE id=?");
            $r->execute([$id]);
            $row = $r->fetch(PDO::FETCH_ASSOC);
            if ($row) deletePhoto($row['foto'], $UPLOAD_DIR);
            $db->prepare("DELETE FROM bpj_periode WHERE id=?")->execute([$id]);
            echo json_encode(['status'=>'success','message'=>'BPJ berhasil dihapus.']);
        }
    }

    /* ══ GEMBALA ══════════════════════════════════════════════ */
    elseif ($resource === 'gembala') {

        if ($method === 'GET') {
            $rows = $db->query("SELECT id, nama, foto, tahun_mulai, tahun_selesai, urutan FROM gembala_jemaat ORDER BY tahun_mulai DESC")->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as &$r) { $r['foto_url'] = $r['foto'] ? $PHOTO_BASE.$r['foto'] : null; }
            echo json_encode(['status'=>'success','data'=>$rows]);
        }

        elseif ($method === 'POST' && !$id) {
            // CREATE
            $nama    = trim($_POST['nama'] ?? '');
            $tMulai  = trim($_POST['tahun_mulai'] ?? '');
            $tSeles  = trim($_POST['tahun_selesai'] ?? '');
            $urutan  = (int)($_POST['urutan'] ?? 0);
            if (!$nama)   throw new Exception("Nama wajib diisi.");
            if (!$tMulai) throw new Exception("Tahun mulai wajib diisi.");
            $foto = uploadPhoto('foto', $UPLOAD_DIR);
            $db->prepare("INSERT INTO gembala_jemaat (nama,foto,tahun_mulai,tahun_selesai,urutan) VALUES(?,?,?,?,?)")
                ->execute([$nama, $foto, $tMulai, $tSeles ?: null, $urutan]);
            echo json_encode(['status'=>'success','message'=>'Gembala berhasil ditambahkan.']);
        }

        elseif ($method === 'POST' && $id) {
            // UPDATE
            $existing = $db->prepare("SELECT foto FROM gembala_jemaat WHERE id=?");
            $existing->execute([$id]);
            $old = $existing->fetch(PDO::FETCH_ASSOC);
            if (!$old) throw new Exception("Data tidak ditemukan.");

            $nama      = trim($_POST['nama'] ?? '');
            $tMulai    = trim($_POST['tahun_mulai'] ?? '');
            $tSeles    = trim($_POST['tahun_selesai'] ?? '');
            $urutan    = (int)($_POST['urutan'] ?? 0);
            $hapusFoto = ($_POST['hapus_foto'] ?? '') === '1';
            if (!$nama)   throw new Exception("Nama wajib diisi.");
            if (!$tMulai) throw new Exception("Tahun mulai wajib diisi.");

            $fotoName = $old['foto'];
            $newFoto  = uploadPhoto('foto', $UPLOAD_DIR);
            if ($newFoto) { deletePhoto($fotoName, $UPLOAD_DIR); $fotoName = $newFoto; }
            elseif ($hapusFoto) { deletePhoto($fotoName, $UPLOAD_DIR); $fotoName = null; }

            $db->prepare("UPDATE gembala_jemaat SET nama=?,foto=?,tahun_mulai=?,tahun_selesai=?,urutan=? WHERE id=?")
                ->execute([$nama, $fotoName, $tMulai, $tSeles ?: null, $urutan, $id]);
            echo json_encode(['status'=>'success','message'=>'Gembala berhasil diperbarui.']);
        }

        elseif ($method === 'DELETE' && $id) {
            $r = $db->prepare("SELECT foto FROM gembala_jemaat WHERE id=?");
            $r->execute([$id]);
            $row = $r->fetch(PDO::FETCH_ASSOC);
            if ($row) deletePhoto($row['foto'], $UPLOAD_DIR);
            $db->prepare("DELETE FROM gembala_jemaat WHERE id=?")->execute([$id]);
            echo json_encode(['status'=>'success','message'=>'Gembala berhasil dihapus.']);
        }
    }

    else {
        http_response_code(400);
        echo json_encode(['status'=>'error','message'=>'Resource tidak dikenal.']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status'=>'error','message'=>$e->getMessage()]);
}
