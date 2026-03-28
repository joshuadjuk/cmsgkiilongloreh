<?php
// ============================================================
// GKII Longloreh - Setup Awal User Default
// Jalankan file ini SEKALI via browser, lalu HAPUS dari server!
// URL: https://gereja.eternity.my.id/api-gkii/init_users.php
// ============================================================

require_once 'config/database.php';

$defaultPassword = 'gkii2024';
$hashedPassword  = password_hash($defaultPassword, PASSWORD_BCRYPT);

$users = [
    ['username' => 'sekretaris', 'nama_lengkap' => 'Sekretaris GKII Longloreh', 'role' => 'sekretaris'],
    ['username' => 'admin',      'nama_lengkap' => 'Admin GKII Longloreh',      'role' => 'admin'],
    ['username' => 'bendahara',  'nama_lengkap' => 'Bendahara GKII Longloreh',  'role' => 'bendahara'],
];

$stmt = $db->prepare(
    "INSERT INTO users (username, password, nama_lengkap, role)
     VALUES (:username, :password, :nama_lengkap, :role)"
);

$results = [];
foreach ($users as $user) {
    try {
        $stmt->execute([
            ':username'     => $user['username'],
            ':password'     => $hashedPassword,
            ':nama_lengkap' => $user['nama_lengkap'],
            ':role'         => $user['role'],
        ]);
        $results[] = "OK: User '{$user['username']}' ({$user['role']}) berhasil dibuat.";
    } catch (PDOException $e) {
        $results[] = "GAGAL: User '{$user['username']}': " . $e->getMessage();
    }
}

echo json_encode([
    'status'           => 'done',
    'message'          => 'Setup selesai. Segera HAPUS file ini dari server!',
    'default_password' => $defaultPassword,
    'results'          => $results,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
