<?php
// backend/index.php
// Front Controller: semua permintaan masuk lewat sini.
// Jalankan dengan:  php -S localhost:8000 index.php
// (argumen "index.php" = router script, supaya file lain TIDAK bisa diakses langsung lewat URL)

require_once __DIR__ . '/library/cors.php';

// 1. Ambil path dari URL
$path = trim((string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH), '/');

// 2. Penyajian foto dari folder uploads/ (hanya gambar, tidak pernah mengeksekusi PHP)
if (strpos($path, 'uploads/') === 0) {
    $name = basename($path);
    $file = __DIR__ . '/uploads/' . $name;
    $ext  = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    $types = ['jpg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'];

    if (isset($types[$ext]) && is_file($file)) {
        header('Content-Type: ' . $types[$ext]);
        header('X-Content-Type-Options: nosniff');
        header('Cache-Control: public, max-age=86400');
        readfile($file);
        exit;
    }

    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Berkas tidak ditemukan.']);
    exit;
}

// 3. Semua respons lainnya berformat JSON
header('Content-Type: application/json; charset=utf-8');

if ($path === '') {
    echo json_encode(['status' => 'success', 'message' => 'Selamat datang di backend portofolio']);
    exit;
}

// 4. Routing: hanya endpoint yang ada di daftar (whitelist) yang boleh dipanggil
$endpoints = [
    'login', 'verify_login', 'logout', 'public', 'users',
    'pendidikan', 'pengalaman', 'keahlian', 'karya', 'kontak',
];

if (in_array($path, $endpoints, true) && is_file(__DIR__ . '/src/' . $path . '.php')) {
    require __DIR__ . '/src/' . $path . '.php';
    exit;
}

http_response_code(404);
echo json_encode(['status' => 'error', 'message' => 'Endpoint tidak ditemukan.']);
