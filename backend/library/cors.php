<?php
// backend/library/cors.php
// Mengizinkan frontend (mis. http://localhost:5173) memanggil API ini (http://localhost:8000).
// Token dikirim lewat header Authorization (bukan cookie), sehingga origin "*" aman untuk
// pengembangan lokal. Untuk produksi, ganti "*" dengan alamat frontend Anda.

$allowedOrigin = getenv('CORS_ORIGIN') ?: '*';

header('Access-Control-Allow-Origin: ' . $allowedOrigin);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 600');

// Permintaan "preflight" dari browser: cukup dijawab 204 tanpa isi.
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}
