<?php
// ============================================================
// GKII Longloreh - Keuangan API (Bendahara)
// Akses: role bendahara & admin
// ============================================================

require_once 'config/database.php';
require_once 'config/jwt.php';

$authUser = requireAuth(['bendahara', 'admin']);

define('UPLOAD_DIR', __DIR__ . '/uploads/bukti/');
define('UPLOAD_URL', 'https://gereja.eternity.my.id/api-gkii/uploads/bukti/');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

// ---- Helpers ----

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

/** Baca input: FormData (multipart) atau JSON */
function getInput(): array
{
    $ct = $_SERVER['CONTENT_TYPE'] ?? '';
    if (strpos($ct, 'multipart/form-data') !== false) {
        return $_POST;
    }
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

/**
 * Handle upload bukti foto.
 * Return nama file baru, atau null jika tidak ada file yang diupload.
 */
function handleFileUpload(): ?string
{
    if (!isset($_FILES['bukti_file']) || $_FILES['bukti_file']['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    $file = $_FILES['bukti_file'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        sendResponse(400, 'Upload file gagal. Kode error: ' . $file['error']);
    }

    // Validasi ukuran (maks 5 MB)
    if ($file['size'] > 5 * 1024 * 1024) {
        sendResponse(400, 'Ukuran file maksimal 5 MB.');
    }

    // Validasi tipe MIME via getimagesize (tidak butuh ekstensi fileinfo)
    $imageInfo = @getimagesize($file['tmp_name']);
    if ($imageInfo === false) {
        sendResponse(400, 'File bukan gambar yang valid.');
    }
    $mimeType = $imageInfo['mime'];

    $allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!in_array($mimeType, $allowed, true)) {
        sendResponse(400, 'Format file harus JPG, PNG, atau WebP.');
    }

    // Ekstensi aman
    $extMap = ['image/jpeg' => 'jpg', 'image/jpg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $ext      = $extMap[$mimeType];
    $filename = 'bukti_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;

    // Buat folder jika belum ada
    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }

    if (!move_uploaded_file($file['tmp_name'], UPLOAD_DIR . $filename)) {
        sendResponse(500, 'Gagal menyimpan file ke server.');
    }

    return $filename;
}

/** Hapus file dari server (silent — tidak error jika tidak ada) */
function deleteFile(?string $filename): void
{
    if ($filename && file_exists(UPLOAD_DIR . $filename)) {
        @unlink(UPLOAD_DIR . $filename);
    }
}

/** Tambahkan bukti_url ke setiap row transaksi */
function withBuktiUrl(array $rows): array
{
    return array_map(function ($row) {
        $row['bukti_url'] = $row['bukti_file'] ? UPLOAD_URL . $row['bukti_file'] : null;
        return $row;
    }, $rows);
}

// ============================================================
switch ($method) {

// ---- GET ----
case 'GET':

    if ($action === 'dashboard') {
        $now   = new DateTime();
        $bulan = (int)$now->format('n');
        $tahun = (int)$now->format('Y');

        $stmtSaldo = $db->query(
            "SELECT
               COALESCE((SELECT jumlah FROM keuangan_saldo_awal ORDER BY tahun ASC, bulan ASC LIMIT 1), 0)
               + COALESCE((SELECT SUM(CASE WHEN tipe='pemasukan' THEN jumlah ELSE -jumlah END)
                           FROM keuangan_transaksi), 0)
             AS saldo_total"
        );
        $saldoTotal = (float)$stmtSaldo->fetchColumn();

        $stmtBulan = $db->prepare(
            "SELECT
               COALESCE(SUM(CASE WHEN tipe='pemasukan'    THEN jumlah ELSE 0 END), 0) AS pemasukan,
               COALESCE(SUM(CASE WHEN tipe='pengeluaran'  THEN jumlah ELSE 0 END), 0) AS pengeluaran,
               COUNT(*) AS jumlah_transaksi
             FROM keuangan_transaksi
             WHERE MONTH(tanggal) = :bulan AND YEAR(tanggal) = :tahun"
        );
        $stmtBulan->execute([':bulan' => $bulan, ':tahun' => $tahun]);
        $bulanData = $stmtBulan->fetch(PDO::FETCH_ASSOC);

        $stmtRecent = $db->query(
            "SELECT t.id, t.tanggal, t.tipe, t.kategori, t.jumlah, t.keterangan,
                    t.bukti_file, u.nama_lengkap AS dicatat_oleh_nama
             FROM keuangan_transaksi t
             JOIN users u ON u.id = t.dicatat_oleh
             ORDER BY t.tanggal DESC, t.created_at DESC
             LIMIT 5"
        );
        $recent = withBuktiUrl($stmtRecent->fetchAll(PDO::FETCH_ASSOC));

        sendResponse(200, 'Dashboard berhasil dimuat.', [
            'saldo_total'                => $saldoTotal,
            'pemasukan_bulan_ini'        => (float)$bulanData['pemasukan'],
            'pengeluaran_bulan_ini'      => (float)$bulanData['pengeluaran'],
            'jumlah_transaksi_bulan_ini' => (int)$bulanData['jumlah_transaksi'],
            'bulan_label'                => $bulan . '/' . $tahun,
            'transaksi_terakhir'         => $recent,
        ]);
    }

    elseif ($action === 'laporan') {
        $bulan = isset($_GET['bulan']) ? (int)$_GET['bulan'] : (int)date('n');
        $tahun = isset($_GET['tahun']) ? (int)$_GET['tahun'] : (int)date('Y');
        if ($bulan < 1 || $bulan > 12) sendResponse(400, 'Bulan tidak valid.');

        $stmtSaldoAwal = $db->prepare(
            "SELECT
               COALESCE((SELECT jumlah FROM keuangan_saldo_awal ORDER BY tahun ASC, bulan ASC LIMIT 1), 0)
               + COALESCE(
                   (SELECT SUM(CASE WHEN tipe='pemasukan' THEN jumlah ELSE -jumlah END)
                    FROM keuangan_transaksi
                    WHERE YEAR(tanggal) < :tahun
                       OR (YEAR(tanggal) = :tahun2 AND MONTH(tanggal) < :bulan)),
                 0)
             AS saldo_awal"
        );
        $stmtSaldoAwal->execute([':tahun' => $tahun, ':tahun2' => $tahun, ':bulan' => $bulan]);
        $saldoAwal = (float)$stmtSaldoAwal->fetchColumn();

        $stmtTotals = $db->prepare(
            "SELECT
               COALESCE(SUM(CASE WHEN tipe='pemasukan'   THEN jumlah ELSE 0 END), 0) AS total_pemasukan,
               COALESCE(SUM(CASE WHEN tipe='pengeluaran' THEN jumlah ELSE 0 END), 0) AS total_pengeluaran
             FROM keuangan_transaksi
             WHERE MONTH(tanggal) = :bulan AND YEAR(tanggal) = :tahun"
        );
        $stmtTotals->execute([':bulan' => $bulan, ':tahun' => $tahun]);
        $totals = $stmtTotals->fetch(PDO::FETCH_ASSOC);

        $stmtBreakdown = $db->prepare(
            "SELECT tipe, kategori, SUM(jumlah) AS subtotal
             FROM keuangan_transaksi
             WHERE MONTH(tanggal) = :bulan AND YEAR(tanggal) = :tahun
             GROUP BY tipe, kategori ORDER BY tipe, subtotal DESC"
        );
        $stmtBreakdown->execute([':bulan' => $bulan, ':tahun' => $tahun]);
        $breakdownPemasukan = []; $breakdownPengeluaran = [];
        foreach ($stmtBreakdown->fetchAll(PDO::FETCH_ASSOC) as $row) {
            if ($row['tipe'] === 'pemasukan') $breakdownPemasukan[$row['kategori']]  = (float)$row['subtotal'];
            else                              $breakdownPengeluaran[$row['kategori']] = (float)$row['subtotal'];
        }

        $stmtDetail = $db->prepare(
            "SELECT t.id, t.tanggal, t.tipe, t.kategori, t.jumlah, t.keterangan,
                    t.bukti_file, u.nama_lengkap AS dicatat_oleh_nama
             FROM keuangan_transaksi t
             JOIN users u ON u.id = t.dicatat_oleh
             WHERE MONTH(t.tanggal) = :bulan AND YEAR(t.tanggal) = :tahun
             ORDER BY t.tanggal ASC, t.created_at ASC"
        );
        $stmtDetail->execute([':bulan' => $bulan, ':tahun' => $tahun]);
        $transaksi = withBuktiUrl($stmtDetail->fetchAll(PDO::FETCH_ASSOC));

        $tp = (float)$totals['total_pemasukan'];
        $tk = (float)$totals['total_pengeluaran'];
        sendResponse(200, 'Laporan berhasil dimuat.', [
            'bulan' => $bulan, 'tahun' => $tahun,
            'saldo_awal' => $saldoAwal, 'total_pemasukan' => $tp,
            'total_pengeluaran' => $tk, 'saldo_akhir' => $saldoAwal + $tp - $tk,
            'breakdown_pemasukan' => $breakdownPemasukan,
            'breakdown_pengeluaran' => $breakdownPengeluaran,
            'transaksi' => $transaksi,
        ]);
    }

    elseif ($action === 'trend') {
        // Pemasukan & pengeluaran 6 bulan terakhir
        $result = [];
        $monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
        for ($i = 5; $i >= 0; $i--) {
            $ts    = mktime(0, 0, 0, (int)date('n') - $i, 1, (int)date('Y'));
            $key   = date('Y-m', $ts);
            $label = $monthNames[(int)date('n', $ts) - 1] . ' ' . date('Y', $ts);
            $result[$key] = ['bulan_key' => $key, 'label' => $label, 'pemasukan' => 0.0, 'pengeluaran' => 0.0];
        }

        $stmt = $db->query(
            "SELECT DATE_FORMAT(tanggal,'%Y-%m') AS bk,
                    SUM(CASE WHEN tipe='pemasukan'   THEN jumlah ELSE 0 END) AS p,
                    SUM(CASE WHEN tipe='pengeluaran' THEN jumlah ELSE 0 END) AS k
             FROM keuangan_transaksi
             WHERE tanggal >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 5 MONTH),'%Y-%m-01')
             GROUP BY bk ORDER BY bk ASC"
        );
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            if (isset($result[$row['bk']])) {
                $result[$row['bk']]['pemasukan']   = (float)$row['p'];
                $result[$row['bk']]['pengeluaran'] = (float)$row['k'];
            }
        }
        sendResponse(200, 'OK', array_values($result));
    }

    elseif ($action === 'saldo_awal') {
        $bulan = isset($_GET['bulan']) ? (int)$_GET['bulan'] : (int)date('n');
        $tahun = isset($_GET['tahun']) ? (int)$_GET['tahun'] : (int)date('Y');
        $stmt  = $db->prepare("SELECT * FROM keuangan_saldo_awal WHERE bulan=:bulan AND tahun=:tahun LIMIT 1");
        $stmt->execute([':bulan' => $bulan, ':tahun' => $tahun]);
        sendResponse(200, 'OK', $stmt->fetch(PDO::FETCH_ASSOC) ?: null);
    }

    elseif ($id) {
        $stmt = $db->prepare(
            "SELECT t.*, u.nama_lengkap AS dicatat_oleh_nama
             FROM keuangan_transaksi t JOIN users u ON u.id = t.dicatat_oleh
             WHERE t.id = :id"
        );
        $stmt->execute([':id' => $id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$data) sendResponse(404, 'Transaksi tidak ditemukan.');
        $data['bukti_url'] = $data['bukti_file'] ? UPLOAD_URL . $data['bukti_file'] : null;
        sendResponse(200, 'OK', $data);
    }

    else {
        $where = ['1=1']; $params = [];
        if (!empty($_GET['bulan'])) { $where[] = 'MONTH(tanggal) = :bulan'; $params[':bulan'] = (int)$_GET['bulan']; }
        if (!empty($_GET['tahun'])) { $where[] = 'YEAR(tanggal) = :tahun';  $params[':tahun'] = (int)$_GET['tahun']; }
        if (!empty($_GET['tipe']) && in_array($_GET['tipe'], ['pemasukan','pengeluaran'])) {
            $where[] = 'tipe = :tipe'; $params[':tipe'] = $_GET['tipe'];
        }
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 0;
        $sql   = "SELECT t.*, u.nama_lengkap AS dicatat_oleh_nama
                  FROM keuangan_transaksi t JOIN users u ON u.id = t.dicatat_oleh
                  WHERE " . implode(' AND ', $where) . " ORDER BY t.tanggal DESC, t.created_at DESC"
               . ($limit > 0 ? " LIMIT $limit" : "");
        $stmt  = $db->prepare($sql); $stmt->execute($params);
        $data  = withBuktiUrl($stmt->fetchAll(PDO::FETCH_ASSOC));

        $sqlT  = "SELECT COALESCE(SUM(CASE WHEN tipe='pemasukan' THEN jumlah ELSE 0 END),0) AS tp,
                         COALESCE(SUM(CASE WHEN tipe='pengeluaran' THEN jumlah ELSE 0 END),0) AS tk
                  FROM keuangan_transaksi t WHERE " . implode(' AND ', $where);
        $stmtT = $db->prepare($sqlT); $stmtT->execute($params);
        $tot   = $stmtT->fetch(PDO::FETCH_ASSOC);

        sendResponse(200, 'Berhasil.', [
            'transaksi'         => $data,
            'total_pemasukan'   => (float)$tot['tp'],
            'total_pengeluaran' => (float)$tot['tk'],
        ]);
    }
    break;

// ---- POST ----
case 'POST':

    if ($action === 'saldo_awal') {
        $input      = getInput();
        $bulan      = (int)($input['bulan']  ?? 0);
        $tahun      = (int)($input['tahun']  ?? 0);
        $jumlah     = (float)($input['jumlah'] ?? 0);
        $keterangan = trim($input['keterangan'] ?? '');
        if ($bulan < 1 || $bulan > 12 || $tahun < 2000) sendResponse(400, 'Bulan/tahun tidak valid.');
        $stmt = $db->prepare(
            "INSERT INTO keuangan_saldo_awal (bulan, tahun, jumlah, keterangan, dibuat_oleh)
             VALUES (:b,:t,:j,:k,:u) ON DUPLICATE KEY UPDATE jumlah=:j2, keterangan=:k2"
        );
        $stmt->execute([':b'=>$bulan,':t'=>$tahun,':j'=>$jumlah,':k'=>$keterangan?:null,':u'=>$authUser['sub'],':j2'=>$jumlah,':k2'=>$keterangan?:null]);
        sendResponse(200, 'Saldo awal berhasil disimpan.');
    }

    else {
        $input      = getInput();
        $tanggal    = trim($input['tanggal']    ?? '');
        $tipe       = trim($input['tipe']       ?? '');
        $kategori   = trim($input['kategori']   ?? '');
        $jumlah     = (float)($input['jumlah']  ?? 0);
        $keterangan = trim($input['keterangan'] ?? '');

        if (!$tanggal || !in_array($tipe, ['pemasukan','pengeluaran']) || !$kategori || $jumlah <= 0) {
            sendResponse(400, 'Data tidak lengkap. Tanggal, tipe, kategori, dan jumlah wajib diisi.');
        }

        $buktiFile = handleFileUpload(); // null jika tidak ada file

        $stmt = $db->prepare(
            "INSERT INTO keuangan_transaksi (tanggal, tipe, kategori, jumlah, keterangan, bukti_file, dicatat_oleh)
             VALUES (:tanggal,:tipe,:kategori,:jumlah,:keterangan,:bukti,:by)"
        );
        $stmt->execute([
            ':tanggal'    => $tanggal,
            ':tipe'       => $tipe,
            ':kategori'   => $kategori,
            ':jumlah'     => $jumlah,
            ':keterangan' => $keterangan ?: null,
            ':bukti'      => $buktiFile,
            ':by'         => $authUser['sub'],
        ]);
        sendResponse(201, 'Transaksi berhasil disimpan.', ['id' => (int)$db->lastInsertId()]);
    }
    break;

// ---- PUT ----
case 'PUT':
    if (!$id) sendResponse(400, 'ID transaksi diperlukan.');

    // Ambil data lama untuk backup bukti_file
    $stmtOld = $db->prepare("SELECT bukti_file FROM keuangan_transaksi WHERE id = :id");
    $stmtOld->execute([':id' => $id]);
    $oldRow = $stmtOld->fetch(PDO::FETCH_ASSOC);
    if (!$oldRow) sendResponse(404, 'Transaksi tidak ditemukan.');

    $input      = getInput();
    $tanggal    = trim($input['tanggal']    ?? '');
    $tipe       = trim($input['tipe']       ?? '');
    $kategori   = trim($input['kategori']   ?? '');
    $jumlah     = (float)($input['jumlah']  ?? 0);
    $keterangan = trim($input['keterangan'] ?? '');

    if (!$tanggal || !in_array($tipe, ['pemasukan','pengeluaran']) || !$kategori || $jumlah <= 0) {
        sendResponse(400, 'Data tidak lengkap.');
    }

    $newFile = handleFileUpload();
    if ($newFile !== null) {
        // File baru diupload — hapus file lama
        deleteFile($oldRow['bukti_file']);
        $buktiFile = $newFile;
    } else {
        // Cek apakah user minta hapus bukti (kirim hapus_bukti=1)
        $hapusBukti = ($input['hapus_bukti'] ?? '0') === '1';
        if ($hapusBukti) {
            deleteFile($oldRow['bukti_file']);
            $buktiFile = null;
        } else {
            $buktiFile = $oldRow['bukti_file']; // tetap pakai yang lama
        }
    }

    $stmt = $db->prepare(
        "UPDATE keuangan_transaksi
         SET tanggal=:tanggal, tipe=:tipe, kategori=:kategori,
             jumlah=:jumlah, keterangan=:keterangan, bukti_file=:bukti
         WHERE id=:id"
    );
    $stmt->execute([
        ':tanggal'    => $tanggal,
        ':tipe'       => $tipe,
        ':kategori'   => $kategori,
        ':jumlah'     => $jumlah,
        ':keterangan' => $keterangan ?: null,
        ':bukti'      => $buktiFile,
        ':id'         => $id,
    ]);
    sendResponse(200, 'Transaksi berhasil diupdate.');
    break;

// ---- DELETE ----
case 'DELETE':
    if (!$id) sendResponse(400, 'ID transaksi diperlukan.');

    // Ambil nama file sebelum dihapus
    $stmtF = $db->prepare("SELECT bukti_file FROM keuangan_transaksi WHERE id = :id");
    $stmtF->execute([':id' => $id]);
    $row = $stmtF->fetch(PDO::FETCH_ASSOC);
    if (!$row) sendResponse(404, 'Transaksi tidak ditemukan.');

    $stmt = $db->prepare("DELETE FROM keuangan_transaksi WHERE id = :id");
    $stmt->execute([':id' => $id]);

    // Hapus file dari server juga
    deleteFile($row['bukti_file']);

    sendResponse(200, 'Transaksi berhasil dihapus.');
    break;

default:
    sendResponse(405, 'Method tidak diizinkan.');
}
?>
