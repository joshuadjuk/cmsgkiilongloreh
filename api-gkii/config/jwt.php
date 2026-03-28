<?php
// ============================================================
// JWT Helper — digunakan oleh auth.php & semua endpoint secured
// ============================================================

define('JWT_SECRET', 'gkii_longloreh_s3cr3t_k3y_2024_!@#$%');
define('JWT_EXPIRE',  8 * 60 * 60); // 8 jam

function base64url_encode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string
{
    $padLen = (4 - strlen($data) % 4) % 4;
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', $padLen));
}

function generateJWT(array $payload): string
{
    $header    = base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $body      = base64url_encode(json_encode($payload));
    $signature = base64url_encode(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    return "$header.$body.$signature";
}

function verifyJWT(string $token): ?array
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$header, $body, $signature] = $parts;

    $expectedSig = base64url_encode(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    if (!hash_equals($expectedSig, $signature)) return null;

    $data = json_decode(base64url_decode($body), true);
    if (!$data || !isset($data['exp']) || $data['exp'] < time()) return null;

    return $data;
}

/**
 * Verifikasi token dari header Authorization.
 * Jika gagal → langsung kirim response error & exit.
 * Jika berhasil → return payload array.
 *
 * @param  array $allowedRoles  Kosong = semua role diizinkan
 */
function requireAuth(array $allowedRoles = []): array
{
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token      = '';

    if (preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
        $token = trim($matches[1]);
    }

    if ($token === '') {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Token tidak ditemukan.']);
        exit();
    }

    $data = verifyJWT($token);

    if (!$data) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Token tidak valid atau sudah kadaluarsa.']);
        exit();
    }

    if (!empty($allowedRoles) && !in_array($data['role'], $allowedRoles, true)) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Akses ditolak. Role tidak diizinkan.']);
        exit();
    }

    return $data;
}
?>
