<?php
// ============================================================
// GKII Longloreh - Auth API
// POST  /auth.php  → Login
// GET   /auth.php  → Verifikasi token
// ============================================================

require_once 'config/database.php';
require_once 'config/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'POST':
        $input    = json_decode(file_get_contents('php://input'), true);
        $username = trim($input['username'] ?? '');
        $password = trim($input['password'] ?? '');

        if ($username === '' || $password === '') {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Username dan password wajib diisi.']);
            exit();
        }

        $stmt = $db->prepare(
            "SELECT id, username, password, nama_lengkap, role
             FROM users
             WHERE username = :username AND is_active = 1
             LIMIT 1"
        );
        $stmt->execute([':username' => $username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Username atau password salah.']);
            exit();
        }

        $payload = [
            'sub'          => (int) $user['id'],
            'username'     => $user['username'],
            'nama_lengkap' => $user['nama_lengkap'],
            'role'         => $user['role'],
            'iat'          => time(),
            'exp'          => time() + JWT_EXPIRE,
        ];

        $token = generateJWT($payload);

        echo json_encode([
            'status'  => 'success',
            'message' => 'Login berhasil.',
            'token'   => $token,
            'user'    => [
                'id'           => (int) $user['id'],
                'username'     => $user['username'],
                'nama_lengkap' => $user['nama_lengkap'],
                'role'         => $user['role'],
            ],
        ]);
        break;

    case 'GET':
        $data = requireAuth();
        echo json_encode([
            'status' => 'success',
            'user'   => [
                'id'           => $data['sub'],
                'username'     => $data['username'],
                'nama_lengkap' => $data['nama_lengkap'],
                'role'         => $data['role'],
            ],
        ]);
        break;

    case 'PUT':
        // Ganti password — butuh token
        $currentUser = requireAuth();
        $input       = json_decode(file_get_contents('php://input'), true);
        $oldPassword = trim($input['old_password'] ?? '');
        $newPassword = trim($input['new_password'] ?? '');

        if (!$oldPassword || !$newPassword) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Password lama dan baru wajib diisi.']);
            exit();
        }
        if (strlen($newPassword) < 6) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Password baru minimal 6 karakter.']);
            exit();
        }

        $stmt = $db->prepare("SELECT password FROM users WHERE id = :id");
        $stmt->execute([':id' => $currentUser['sub']]);
        $row  = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row || !password_verify($oldPassword, $row['password'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Password lama tidak sesuai.']);
            exit();
        }

        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $db->prepare("UPDATE users SET password = :p WHERE id = :id")
           ->execute([':p' => $newHash, ':id' => $currentUser['sub']]);

        echo json_encode(['status' => 'success', 'message' => 'Password berhasil diubah.']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method tidak diizinkan.']);
}
?>
