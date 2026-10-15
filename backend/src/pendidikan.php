<?php
// backend/src/pendidikan.php
// CRUD riwayat pendidikan. Semua method butuh header Authorization: Bearer <token>
//   GET    /pendidikan            -> daftar
//   POST   /pendidikan            -> tambah   body JSON: nama_institusi, tingkat, jurusan, tahun_mulai, tahun_selesai
//   PUT    /pendidikan            -> ubah     body JSON: id + field di atas
//   DELETE /pendidikan?id=1       -> hapus

require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/commonfunction.php';

requireMethod(['GET', 'POST', 'PUT', 'DELETE']);
require_once __DIR__ . '/../library/dbconnection.php';
verifyToken();

$method = $_SERVER['REQUEST_METHOD'];
$data   = readInput();

// ---------- READ ----------
if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT id, nama_institusi, tingkat, jurusan, tahun_mulai, tahun_selesai FROM riwayat_pendidikan ORDER BY tahun_mulai DESC, id DESC');
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    jsonResponse(200, ['status' => 'success', 'riwayat_pendidikan' => $rows]);
}

$id = (int) ($data['id'] ?? $_GET['id'] ?? 0);

// ---------- DELETE ----------
if ($method === 'DELETE') {
    if ($id <= 0) {
        jsonError(400, 'ID tidak valid.');
    }
    if (!rowExists('riwayat_pendidikan', $id)) {
        jsonError(404, 'Data tidak ditemukan.');
    }
    $stmt = $conn->prepare('DELETE FROM riwayat_pendidikan WHERE id = ? LIMIT 1');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->close();
    jsonResponse(200, ['status' => 'success', 'message' => 'Berhasil menghapus riwayat pendidikan']);
}

// ---------- Validasi untuk POST & PUT ----------
$namaInstitusi = inputString($data, 'nama_institusi');
$tingkat       = inputString($data, 'tingkat');
$jurusan       = inputString($data, 'jurusan');
$tahunMulai    = (int) inputString($data, 'tahun_mulai');
$tahunSelesai  = (int) inputString($data, 'tahun_selesai');

if ($namaInstitusi === '' || $tingkat === '' || $jurusan === '') {
    jsonError(400, 'Institusi, tingkat, dan jurusan tidak boleh kosong.');
}
if (tooLong($namaInstitusi) || tooLong($tingkat) || tooLong($jurusan)) {
    jsonError(400, 'Ada isian yang terlalu panjang (maksimal 255 karakter).');
}
if ($err = validateYears($tahunMulai, $tahunSelesai)) {
    jsonError(400, $err);
}

// ---------- CREATE ----------
if ($method === 'POST') {
    $stmt = $conn->prepare('INSERT INTO riwayat_pendidikan (nama_institusi, tingkat, jurusan, tahun_mulai, tahun_selesai) VALUES (?, ?, ?, ?, ?)');
    $stmt->bind_param('sssii', $namaInstitusi, $tingkat, $jurusan, $tahunMulai, $tahunSelesai);
    $stmt->execute();
    $newId = $conn->insert_id;
    $stmt->close();
    jsonResponse(201, ['status' => 'success', 'message' => 'Berhasil menyimpan riwayat pendidikan', 'id' => $newId]);
}

// ---------- UPDATE ----------
if ($id <= 0) {
    jsonError(400, 'ID tidak valid.');
}
if (!rowExists('riwayat_pendidikan', $id)) {
    jsonError(404, 'Data tidak ditemukan.');
}
$stmt = $conn->prepare('UPDATE riwayat_pendidikan SET nama_institusi=?, tingkat=?, jurusan=?, tahun_mulai=?, tahun_selesai=? WHERE id=? LIMIT 1');
$stmt->bind_param('sssiii', $namaInstitusi, $tingkat, $jurusan, $tahunMulai, $tahunSelesai, $id);
$stmt->execute();
$stmt->close();
jsonResponse(200, ['status' => 'success', 'message' => 'Berhasil memperbarui riwayat pendidikan']);
