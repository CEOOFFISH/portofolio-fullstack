<?php
// backend/src/users.php
// GET  /users  -> data profil admin yang sedang login
// POST /users  -> perbarui profil (multipart/form-data, boleh sertakan file "foto") — dipakai frontend
// PUT  /users  -> perbarui profil (JSON, tanpa foto)
// Semua butuh header Authorization: Bearer <token>

require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/commonfunction.php';

requireMethod(['GET', 'POST', 'PUT']);
require_once __DIR__ . '/../library/dbconnection.php';

$userId = verifyToken();
$method = $_SERVER['REQUEST_METHOD'];

// ---------------- GET: ambil profil (tanpa password & token) ----------------
if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT id, username, email, nama_lengkap, nomor_hp, foto, created_at FROM users WHERE id = ? LIMIT 1');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    jsonResponse(200, ['status' => 'success', 'user' => $user]);
}

// ---------------- Update profil ----------------

// Jika ukuran request melebihi post_max_size, PHP mengosongkan $_POST dan $_FILES
$iniToBytes = function (string $v): int {
    $v = trim($v);
    $n = (int) $v;
    switch (strtolower(substr($v, -1))) {
        case 'g': $n *= 1024;
        // no break
        case 'm': $n *= 1024;
        // no break
        case 'k': $n *= 1024;
    }
    return $n;
};
$contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
$postMax = $iniToBytes((string) ini_get('post_max_size'));
if ($postMax > 0 && $contentLength > $postMax) {
    jsonError(413, 'Ukuran data yang dikirim terlalu besar. Foto maksimal 5 MB.');
}

$data        = readInput();
$username    = inputString($data, 'username');
$email       = inputString($data, 'email');
$namaLengkap = inputString($data, 'nama_lengkap');
$nomorHp     = inputString($data, 'nomor_hp');
$password    = isset($data['password']) && is_string($data['password']) ? trim($data['password']) : '';

// Validasi di backend (jangan hanya mengandalkan frontend)
if ($username === '' || $email === '' || $namaLengkap === '' || $nomorHp === '') {
    jsonError(400, 'Username, email, nama lengkap, dan nomor HP tidak boleh kosong.');
}
if (tooLong($username) || tooLong($email) || tooLong($namaLengkap) || tooLong($nomorHp, 50)) {
    jsonError(400, 'Ada isian yang terlalu panjang.');
}
if (!preg_match('/^[A-Za-z0-9_.-]{3,50}$/', $username)) {
    jsonError(400, 'Username 3-50 karakter: huruf, angka, titik, garis bawah, atau strip.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonError(400, 'Format email tidak valid.');
}
if (!preg_match('/^[0-9+\-\s()]{6,20}$/', $nomorHp)) {
    jsonError(400, 'Nomor HP hanya boleh berisi angka, +, -, spasi, dan tanda kurung (6-20 karakter).');
}
if ($password !== '' && (strlen($password) < 6 || strlen($password) > 72)) {
    jsonError(400, 'Password baru harus 6-72 karakter.');
}

// Username tidak boleh dipakai user lain
$stmt = $conn->prepare('SELECT id FROM users WHERE username = ? AND id <> ? LIMIT 1');
$stmt->bind_param('si', $username, $userId);
$stmt->execute();
$taken = $stmt->get_result()->num_rows > 0;
$stmt->close();
if ($taken) {
    jsonError(409, 'Username sudah dipakai.');
}

// Foto lama (dipertahankan jika tidak ada upload baru)
$stmt = $conn->prepare('SELECT foto FROM users WHERE id = ? LIMIT 1');
$stmt->bind_param('i', $userId);
$stmt->execute();
$oldFoto = (string) ($stmt->get_result()->fetch_assoc()['foto'] ?? '');
$stmt->close();

$foto = $oldFoto;
$newFotoPath = null;

// ---------------- Upload foto (4 lapis perlindungan) ----------------
if (isset($_FILES['foto']) && $_FILES['foto']['error'] !== UPLOAD_ERR_NO_FILE) {
    $file = $_FILES['foto'];

    // 1. Kode error upload
    if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE) {
        jsonError(413, 'Ukuran foto melebihi batas server. Maksimal 5 MB.');
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        jsonError(400, 'Upload foto gagal. Silakan coba lagi.');
    }

    // 2. Ukuran maksimal 5 MB
    if ($file['size'] > 5 * 1024 * 1024) {
        jsonError(413, 'Ukuran foto maksimal 5 MB.');
    }

    // 3. MIME type ASLI (dibaca dari isi file, bukan dari nama/ekstensi)
    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    if (!isset($allowed[$mime]) || @getimagesize($file['tmp_name']) === false) {
        jsonError(415, 'Format foto harus JPG, PNG, atau WEBP.');
    }

    // 4. Nama acak + ekstensi ditentukan server (bukan dari nama file pengguna)
    $dir = __DIR__ . '/../uploads';
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
        jsonError(500, 'Folder uploads tidak dapat dibuat.');
    }
    $foto = bin2hex(random_bytes(16)) . '.' . $allowed[$mime];
    $newFotoPath = $dir . '/' . $foto;

    if (!move_uploaded_file($file['tmp_name'], $newFotoPath)) {
        jsonError(500, 'Gagal menyimpan foto ke server.');
    }
}

// ---------------- Simpan ke database ----------------
if ($password !== '') {
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare('UPDATE users SET username=?, email=?, `password`=?, nama_lengkap=?, nomor_hp=?, foto=? WHERE id=? LIMIT 1');
    $stmt->bind_param('ssssssi', $username, $email, $hash, $namaLengkap, $nomorHp, $foto, $userId);
} else {
    $stmt = $conn->prepare('UPDATE users SET username=?, email=?, nama_lengkap=?, nomor_hp=?, foto=? WHERE id=? LIMIT 1');
    $stmt->bind_param('sssssi', $username, $email, $namaLengkap, $nomorHp, $foto, $userId);
}

try {
    $stmt->execute();
} catch (Throwable $e) {
    // Jika database gagal, hapus foto baru agar tidak jadi file yatim
    if ($newFotoPath && is_file($newFotoPath)) {
        unlink($newFotoPath);
    }
    throw $e;
}
$stmt->close();

// Hapus foto lama (kecuali default / foto yang sama)
if ($newFotoPath && $oldFoto !== '' && $oldFoto !== 'default.png' && $oldFoto !== $foto) {
    $oldPath = __DIR__ . '/../uploads/' . basename($oldFoto);
    if (is_file($oldPath)) {
        unlink($oldPath);
    }
}

jsonResponse(200, [
    'status'  => 'success',
    'message' => 'Berhasil memperbarui data user',
    'user'    => [
        'id'           => $userId,
        'username'     => $username,
        'email'        => $email,
        'nama_lengkap' => $namaLengkap,
        'nomor_hp'     => $nomorHp,
        'foto'         => $foto,
    ],
]);
