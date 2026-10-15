<?php
// backend/src/keahlian.php
// CRUD keahlian (skills). Semua method butuh header Authorization: Bearer <token>
//   GET    /keahlian          -> daftar
//   POST   /keahlian          -> tambah   body JSON: nama_keahlian, level
//   PUT    /keahlian          -> ubah     body JSON: id, nama_keahlian, level
//   DELETE /keahlian?id=1     -> hapus

require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/commonfunction.php';

requireMethod(['GET', 'POST', 'PUT', 'DELETE']);
require_once __DIR__ . '/../library/dbconnection.php';
verifyToken();

$method = $_SERVER['REQUEST_METHOD'];
$data   = readInput();

// Level yang diterima (kolom di database berupa teks bebas; daftar ini hanya validasi tambahan)
$allowedLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT id, nama_keahlian, level FROM keahlian ORDER BY id DESC');
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    jsonResponse(200, ['status' => 'success', 'keahlian' => $rows]);
}

$id = (int) ($data['id'] ?? $_GET['id'] ?? 0);

if ($method === 'DELETE') {
    if ($id <= 0) {
        jsonError(400, 'ID tidak valid.');
    }
    if (!rowExists('keahlian', $id)) {
        jsonError(404, 'Data tidak ditemukan.');
    }
    $stmt = $conn->prepare('DELETE FROM keahlian WHERE id = ? LIMIT 1');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->close();
    jsonResponse(200, ['status' => 'success', 'message' => 'Berhasil menghapus keahlian']);
}

$namaKeahlian = inputString($data, 'nama_keahlian');
$level        = inputString($data, 'level');

if ($namaKeahlian === '' || $level === '') {
    jsonError(400, 'Nama keahlian dan level tidak boleh kosong.');
}
if (tooLong($namaKeahlian)) {
    jsonError(400, 'Nama keahlian terlalu panjang (maksimal 255 karakter).');
}
if (!in_array($level, $allowedLevels, true)) {
    jsonError(400, 'Level harus salah satu dari: ' . implode(', ', $allowedLevels) . '.');
}

if ($method === 'POST') {
    $stmt = $conn->prepare('INSERT INTO keahlian (nama_keahlian, level) VALUES (?, ?)');
    $stmt->bind_param('ss', $namaKeahlian, $level);
    $stmt->execute();
    $newId = $conn->insert_id;
    $stmt->close();
    jsonResponse(201, ['status' => 'success', 'message' => 'Berhasil menyimpan keahlian', 'id' => $newId]);
}

// PUT
if ($id <= 0) {
    jsonError(400, 'ID tidak valid.');
}
if (!rowExists('keahlian', $id)) {
    jsonError(404, 'Data tidak ditemukan.');
}
$stmt = $conn->prepare('UPDATE keahlian SET nama_keahlian=?, level=? WHERE id=? LIMIT 1');
$stmt->bind_param('ssi', $namaKeahlian, $level, $id);
$stmt->execute();
$stmt->close();
jsonResponse(200, ['status' => 'success', 'message' => 'Berhasil memperbarui keahlian']);
