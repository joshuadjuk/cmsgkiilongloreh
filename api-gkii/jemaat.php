<?php
// api-gkii/jemaat.php

// 1. Include Koneksi Database
require_once 'config/database.php';

// 2. Tentukan Method Request (GET, POST, PUT, DELETE)
$method = $_SERVER['REQUEST_METHOD'];

// Helper function untuk mengirim response JSON
function sendResponse($status, $message, $data = null) {
    http_response_code($status);
    echo json_encode([
        "status" => $status === 200 || $status === 201 ? "success" : "error",
        "message" => $message,
        "data" => $data
    ]);
    exit();
}

// 3. Logika Utama berdasarkan Method
switch ($method) {
    
    // === READ: Mengambil Data Jemaat ===
    case 'GET':
        try {
            // Cek apakah request untuk satu orang (detail) atau semua
            if (isset($_GET['id'])) {
                // Ambil satu data
                $stmt = $db->prepare("SELECT * FROM members WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($data) {
                    sendResponse(200, "Data jemaat ditemukan", $data);
                } else {
                    sendResponse(404, "Data jemaat tidak ditemukan");
                }
            } else {
                // Ambil semua data (bisa ditambah pagination nanti)
                // Kita JOIN dengan tabel families supaya tahu dia keluarga siapa (opsional)
                $query = "SELECT members.*, families.kepala_keluarga, families.nomor_kk 
                          FROM members 
                          LEFT JOIN families ON members.family_id = families.id 
                          ORDER BY members.nama_lengkap ASC";
                          
                $stmt = $db->query($query);
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                sendResponse(200, "Berhasil mengambil semua data jemaat", $data);
            }
        } catch (Exception $e) {
            sendResponse(500, "Gagal mengambil data: " . $e->getMessage());
        }
        break;

    // === CREATE: Menambah Jemaat Baru ===
    case 'POST':
        try {
            // Ambil data JSON yang dikirim React
            $input = json_decode(file_get_contents("php://input"), true);
            
            // Validasi input minimal
            if (empty($input['nama_lengkap']) || empty($input['jenis_kelamin'])) {
                sendResponse(400, "Nama Lengkap dan Jenis Kelamin wajib diisi!");
            }

            // Query Insert
            $sql = "INSERT INTO members (
                        family_id, nama_lengkap, nik, jenis_kelamin, tempat_lahir, tanggal_lahir, 
                        golongan_darah, no_hp, kategori_jemaat, status_baptis, tanggal_baptis, 
                        status_nikah, pekerjaan, status_keaktifan
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?, 
                        ?, ?, ?, ?, ?, 
                        ?, ?, ?
                    )";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([
                $input['family_id'] ?? null, // Bisa null jika belum ada KK
                $input['nama_lengkap'],
                $input['nik'] ?? null,
                $input['jenis_kelamin'],
                $input['tempat_lahir'] ?? null,
                $input['tanggal_lahir'] ?? null,
                $input['golongan_darah'] ?? null,
                $input['no_hp'] ?? null,
                $input['kategori_jemaat'] ?? 'Sekolah Minggu',
                $input['status_baptis'] ?? 'Belum',
                $input['tanggal_baptis'] ?? null,
                $input['status_nikah'] ?? 'Belum Menikah',
                $input['pekerjaan'] ?? null,
                $input['status_keaktifan'] ?? 'Aktif'
            ]);

            sendResponse(201, "Jemaat baru berhasil ditambahkan!");

        } catch (Exception $e) {
            sendResponse(500, "Gagal menambah data: " . $e->getMessage());
        }
        break;

    // === UPDATE: Mengubah Data Jemaat ===
    case 'PUT':
        try {
            // Ambil data JSON
            $input = json_decode(file_get_contents("php://input"), true);
            
            // Ambil ID dari Parameter URL atau Body
            $id = $_GET['id'] ?? $input['id'] ?? null;
            
            if (!$id) {
                sendResponse(400, "ID Jemaat tidak ditemukan untuk update.");
            }

            // Query Update yang dinamis (hanya update field yang dikirim)
            // Namun untuk simpel, kita update semua field utama
            $sql = "UPDATE members SET 
                        family_id = ?, nama_lengkap = ?, nik = ?, jenis_kelamin = ?, 
                        tempat_lahir = ?, tanggal_lahir = ?, golongan_darah = ?, no_hp = ?, 
                        kategori_jemaat = ?, status_baptis = ?, tanggal_baptis = ?, 
                        status_nikah = ?, pekerjaan = ?, status_keaktifan = ?
                    WHERE id = ?";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([
                $input['family_id'] ?? null,
                $input['nama_lengkap'],
                $input['nik'] ?? null,
                $input['jenis_kelamin'],
                $input['tempat_lahir'] ?? null,
                $input['tanggal_lahir'] ?? null,
                $input['golongan_darah'] ?? null,
                $input['no_hp'] ?? null,
                $input['kategori_jemaat'],
                $input['status_baptis'],
                $input['tanggal_baptis'] ?? null,
                $input['status_nikah'],
                $input['pekerjaan'] ?? null,
                $input['status_keaktifan'],
                $id
            ]);

            sendResponse(200, "Data jemaat berhasil diperbarui!");

        } catch (Exception $e) {
            sendResponse(500, "Gagal update data: " . $e->getMessage());
        }
        break;

    // === DELETE: Menghapus Jemaat ===
    case 'DELETE':
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                sendResponse(400, "ID Jemaat diperlukan untuk menghapus.");
            }

            $stmt = $db->prepare("DELETE FROM members WHERE id = ?");
            $stmt->execute([$id]);

            sendResponse(200, "Data jemaat berhasil dihapus permanen.");

        } catch (Exception $e) {
            sendResponse(500, "Gagal menghapus data: " . $e->getMessage());
        }
        break;
        
    default:
        sendResponse(405, "Method not allowed");
        break;
}
?>