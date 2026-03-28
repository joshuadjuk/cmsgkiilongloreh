<?php
// ============================================================
// GKII Longloreh - Users API (Admin Only)
// GET    → list semua user
// POST   → buat user baru
// PUT    → update user (?id=X)
// DELETE → hapus user (?id=X)
// ============================================================

require_once 'config/database.php';
require_once 'config/jwt.php';

$authUser = requireAuth(['admin']);

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

function sendResponse(int $status, string $message, $data = null): void
{
    http_response_code($status);
    echo json_encode([
        'status'  => ($status >= 200 && $status < 300) ? 'success' : 'error',
        'message' => $message,
        'data'    => $data,
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

switch ($method) {

    case 'GET':
        $stmt = $db->query(
            "SELECT id, username, nama_lengkap, role, is_active, created_at
             FROM users ORDER BY role, nama_lengkap"
        );
        sendResponse(200, 'OK', $stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'POST':
        $input    = json_decode(file_get_contents('php://input'), true) ?? [];
        $username = trim($input['username']     ?? '');
        $nama     = trim($input['nama_lengkap'] ?? '');
        $role     = trim($input['role']         ?? '');
        $password = trim($input['password']     ?? '');

        if (!$username || !$nama || !$password) {
            sendResponse(400, 'Username, nama, dan password wajib diisi.');
        }
        if (!in_array($role, ['admin', 'sekretaris', 'bendahara'], true)) {
            sendResponse(400, 'Role tidak valid.');
        }
        if (strlen($password) < 6) {
            sendResponse(400, 'Password minimal 6 karakter.');
        }

        $check = $db->prepare("SELECT id FROM users WHERE username = :u");
        $check->execute([':u' => $username]);
        if ($check->fetch()) sendResponse(409, 'Username sudah digunakan.');

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $db->prepare(
            "INSERT INTO users (username, password, nama_lengkap, role, is_active)
             VALUES (:u, :p, :n, :r, 1)"
        );
        $stmt->execute([':u' => $username, ':p' => $hash, ':n' => $nama, ':r' => $role]);
        sendResponse(201, 'User berhasil dibuat.', ['id' => (int)$db->lastInsertId()]);
        break;

    case 'PUT':
        if (!$id) sendResponse(400, 'ID diperlukan.');

        $input    = json_decode(file_get_contents('php://input'), true) ?? [];
        $nama     = trim($input['nama_lengkap'] ?? '');
        $role     = trim($input['role']         ?? '');
        $isActive = array_key_exists('is_active', $input) ? (int)$input['is_active'] : null;
        $newPw    = trim($input['new_password'] ?? '');

        if (!$nama || !in_array($role, ['admin', 'sekretaris', 'bendahara'], true)) {
            sendResponse(400, 'Nama dan role wajib diisi.');
        }

        // Tidak boleh ubah role / nonaktifkan akun sendiri
        if ($id === (int)$authUser['sub']) {
            if ($role !== 'admin') sendResponse(400, 'Tidak bisa mengubah role akun sendiri.');
            if ($isActive === 0)   sendResponse(400, 'Tidak bisa menonaktifkan akun sendiri.');
        }

        if ($newPw) {
            if (strlen($newPw) < 6) sendResponse(400, 'Password minimal 6 karakter.');
            $hash = password_hash($newPw, PASSWORD_BCRYPT);
            $stmt = $db->prepare(
                "UPDATE users SET nama_lengkap=:n, role=:r, password=:p
                  " . ($isActive !== null ? ", is_active=:a" : "") . "
                 WHERE id=:id"
            );
            $params = [':n' => $nama, ':r' => $role, ':p' => $hash, ':id' => $id];
            if ($isActive !== null) $params[':a'] = $isActive;
            $stmt->execute($params);
        } else {
            $stmt = $db->prepare(
                "UPDATE users SET nama_lengkap=:n, role=:r
                  " . ($isActive !== null ? ", is_active=:a" : "") . "
                 WHERE id=:id"
            );
            $params = [':n' => $nama, ':r' => $role, ':id' => $id];
            if ($isActive !== null) $params[':a'] = $isActive;
            $stmt->execute($params);
        }
        sendResponse(200, 'User berhasil diupdate.');
        break;

    case 'DELETE':
        if (!$id) sendResponse(400, 'ID diperlukan.');
        if ($id === (int)$authUser['sub']) sendResponse(400, 'Tidak bisa menghapus akun sendiri.');
        $db->prepare("DELETE FROM users WHERE id = :id")->execute([':id' => $id]);
        sendResponse(200, 'User berhasil dihapus.');
        break;

    default:
        sendResponse(405, 'Method tidak diizinkan.');
}
?>
