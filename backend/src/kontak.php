<?php
// backend/src/kontak.php
// CRUD kontak & media sosial. Semua method butuh header Authorization: Bearer <token>
//   GET    /kontak          -> daftar
//   POST   /kontak          -> tambah   body JSON: nama_media, url
//   PUT    /kontak          -> ubah     body JSON: id, nama_media, url
//   DELETE /kontak?id=1     -> hapus

require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/commonfunction.php';

requireMethod(['GET', 'POST', 'PUT', 'DELETE']);
require_once __DIR__ . '/../library/dbconnection.php';
verifyToken();

$method = $_SERVER['REQUEST_METHOD'];
$data   = readInput();

if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT id, nama_media, url FROM kontak_aktif ORDER BY id ASC');
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    jsonResponse(200, ['status' => 'success', 'kontak_aktif' => $rows]);
}

$id = (int) ($data['id'] ?? $_GET['id'] ?? 0);

if ($method === 'DELETE') {
    if ($id <= 0) {
        jsonError(400, 'ID tidak valid.');
    }
    if (!rowExists('kontak_aktif', $id)) {
        jsonError(404, 'Data tidak ditemukan.');
    }
    $stmt = $conn->prepare('DELETE FROM kontak_aktif WHERE id = ? LIMIT 1');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->close();
    jsonResponse(200, ['status' => 'success', 'message' => 'Berhasil menghapus kontak']);
}

$namaMedia = inputString($data, 'nama_media');
$url       = inputString($data, 'url');

if ($namaMedia === '' || $url === '') {
    jsonError(400, 'Nama media dan URL tidak boleh kosong.');
}
if (tooLong($namaMedia)) {
    jsonError(400, 'Nama media terlalu panjang (maksimal 255 karakter).');
}
if (!validateUrl($url, true)) {
    jsonError(400, 'URL harus diawali http://, https://, atau mailto: dan berformat benar.');
}

if ($method === 'POST') {
    $stmt = $conn->prepare('INSERT INTO kontak_aktif (nama_media, `url`) VALUES (?, ?)');
    $stmt->bind_param('ss', $namaMedia, $url);
    $stmt->execute();
    $newId = $conn->insert_id;
    $stmt->close();
    jsonResponse(201, ['status' => 'success', 'message' => 'Berhasil menyimpan kontak', 'id' => $newId]);
}

// PUT
if ($id <= 0) {
    jsonError(400, 'ID tidak valid.');
}
if (!rowExists('kontak_aktif', $id)) {
    jsonError(404, 'Data tidak ditemukan.');
}
$stmt = $conn->prepare('UPDATE kontak_aktif SET nama_media=?, `url`=? WHERE id=? LIMIT 1');
$stmt->bind_param('ssi', $namaMedia, $url, $id);
$stmt->execute();
$stmt->close();
jsonResponse(200, ['status' => 'success', 'message' => 'Berhasil memperbarui kontak']);
