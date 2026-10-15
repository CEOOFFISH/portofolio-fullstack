<?php
// backend/src/karya.php
// CRUD karya terbaik (proyek). Semua method butuh header Authorization: Bearer <token>
//   GET    /karya          -> daftar
//   POST   /karya          -> tambah   body JSON: nama_karya, deskripsi, url
//   PUT    /karya          -> ubah     body JSON: id, nama_karya, deskripsi, url
//   DELETE /karya?id=1     -> hapus

require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/commonfunction.php';

requireMethod(['GET', 'POST', 'PUT', 'DELETE']);
require_once __DIR__ . '/../library/dbconnection.php';
verifyToken();

$method = $_SERVER['REQUEST_METHOD'];
$data   = readInput();

if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT id, nama_karya, deskripsi, url FROM karya_terbaik ORDER BY id DESC');
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    jsonResponse(200, ['status' => 'success', 'karya_terbaik' => $rows]);
}

$id = (int) ($data['id'] ?? $_GET['id'] ?? 0);

if ($method === 'DELETE') {
    if ($id <= 0) {
        jsonError(400, 'ID tidak valid.');
    }
    if (!rowExists('karya_terbaik', $id)) {
        jsonError(404, 'Data tidak ditemukan.');
    }
    $stmt = $conn->prepare('DELETE FROM karya_terbaik WHERE id = ? LIMIT 1');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->close();
    jsonResponse(200, ['status' => 'success', 'message' => 'Berhasil menghapus karya']);
}

$namaKarya = inputString($data, 'nama_karya');
$deskripsi = inputString($data, 'deskripsi');
$url       = inputString($data, 'url');

if ($namaKarya === '' || $deskripsi === '' || $url === '') {
    jsonError(400, 'Nama karya, deskripsi, dan URL tidak boleh kosong.');
}
if (tooLong($namaKarya) || tooLong($deskripsi, 5000)) {
    jsonError(400, 'Nama karya (maks. 255) atau deskripsi (maks. 5000 karakter) terlalu panjang.');
}
if (!validateUrl($url)) {
    jsonError(400, 'URL harus diawali http:// atau https:// dan berformat benar.');
}

if ($method === 'POST') {
    $stmt = $conn->prepare('INSERT INTO karya_terbaik (nama_karya, deskripsi, url) VALUES (?, ?, ?)');
    $stmt->bind_param('sss', $namaKarya, $deskripsi, $url);
    $stmt->execute();
    $newId = $conn->insert_id;
    $stmt->close();
    jsonResponse(201, ['status' => 'success', 'message' => 'Berhasil menyimpan karya', 'id' => $newId]);
}

// PUT
if ($id <= 0) {
    jsonError(400, 'ID tidak valid.');
}
if (!rowExists('karya_terbaik', $id)) {
    jsonError(404, 'Data tidak ditemukan.');
}
$stmt = $conn->prepare('UPDATE karya_terbaik SET nama_karya=?, deskripsi=?, url=? WHERE id=? LIMIT 1');
$stmt->bind_param('sssi', $namaKarya, $deskripsi, $url, $id);
$stmt->execute();
$stmt->close();
jsonResponse(200, ['status' => 'success', 'message' => 'Berhasil memperbarui karya']);
