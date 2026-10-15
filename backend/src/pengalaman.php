<?php
// backend/src/pengalaman.php
// CRUD pengalaman kerja / organisasi. Semua method butuh header Authorization: Bearer <token>
//   GET    /pengalaman           -> daftar
//   POST   /pengalaman           -> tambah   body JSON: nama_perusahaan, jabatan, tahun_mulai, tahun_selesai
//   PUT    /pengalaman           -> ubah     body JSON: id + field di atas
//   DELETE /pengalaman?id=1      -> hapus

require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/commonfunction.php';

requireMethod(['GET', 'POST', 'PUT', 'DELETE']);
require_once __DIR__ . '/../library/dbconnection.php';
verifyToken();

$method = $_SERVER['REQUEST_METHOD'];
$data   = readInput();

if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT id, nama_perusahaan, jabatan, tahun_mulai, tahun_selesai FROM pengalaman ORDER BY tahun_mulai DESC, id DESC');
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    jsonResponse(200, ['status' => 'success', 'pengalaman' => $rows]);
}

$id = (int) ($data['id'] ?? $_GET['id'] ?? 0);

if ($method === 'DELETE') {
    if ($id <= 0) {
        jsonError(400, 'ID tidak valid.');
    }
    if (!rowExists('pengalaman', $id)) {
        jsonError(404, 'Data tidak ditemukan.');
    }
    $stmt = $conn->prepare('DELETE FROM pengalaman WHERE id = ? LIMIT 1');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->close();
    jsonResponse(200, ['status' => 'success', 'message' => 'Berhasil menghapus pengalaman']);
}

$namaPerusahaan = inputString($data, 'nama_perusahaan');
$jabatan        = inputString($data, 'jabatan');
$tahunMulai     = (int) inputString($data, 'tahun_mulai');
$tahunSelesai   = (int) inputString($data, 'tahun_selesai');

if ($namaPerusahaan === '' || $jabatan === '') {
    jsonError(400, 'Nama perusahaan/organisasi dan jabatan tidak boleh kosong.');
}
if (tooLong($namaPerusahaan) || tooLong($jabatan)) {
    jsonError(400, 'Ada isian yang terlalu panjang (maksimal 255 karakter).');
}
if ($err = validateYears($tahunMulai, $tahunSelesai)) {
    jsonError(400, $err);
}

if ($method === 'POST') {
    $stmt = $conn->prepare('INSERT INTO pengalaman (nama_perusahaan, jabatan, tahun_mulai, tahun_selesai) VALUES (?, ?, ?, ?)');
    $stmt->bind_param('ssii', $namaPerusahaan, $jabatan, $tahunMulai, $tahunSelesai);
    $stmt->execute();
    $newId = $conn->insert_id;
    $stmt->close();
    jsonResponse(201, ['status' => 'success', 'message' => 'Berhasil menyimpan pengalaman', 'id' => $newId]);
}

// PUT
if ($id <= 0) {
    jsonError(400, 'ID tidak valid.');
}
if (!rowExists('pengalaman', $id)) {
    jsonError(404, 'Data tidak ditemukan.');
}
$stmt = $conn->prepare('UPDATE pengalaman SET nama_perusahaan=?, jabatan=?, tahun_mulai=?, tahun_selesai=? WHERE id=? LIMIT 1');
$stmt->bind_param('ssiii', $namaPerusahaan, $jabatan, $tahunMulai, $tahunSelesai, $id);
$stmt->execute();
$stmt->close();
jsonResponse(200, ['status' => 'success', 'message' => 'Berhasil memperbarui pengalaman']);
