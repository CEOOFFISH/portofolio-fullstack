<?php
// backend/migration/reset.php
// KHUSUS PENGEMBANGAN: menghapus SELURUH database lalu membuatnya ulang.
// Tidak pernah dipanggil otomatis. Harus dijalankan manual dan butuh persetujuan (ketik nama database).
// Jalankan dari folder backend/ :   php migration/reset.php

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Hanya boleh dijalankan lewat terminal.');
}

define('ALLOW_NO_DB', true);

require_once __DIR__ . '/../library/commonfunction.php';
require_once __DIR__ . '/../library/dbconnection.php';

echo "PERINGATAN: database \"" . DB_NAME . "\" beserta SEMUA datanya akan DIHAPUS.\n";
echo "Ketik nama database (" . DB_NAME . ") untuk melanjutkan, atau tekan Enter untuk batal: ";

$answer = trim((string) fgets(STDIN));
if ($answer !== DB_NAME) {
    echo "Dibatalkan. Tidak ada yang dihapus.\n";
    exit(0);
}

executeQuery('DROP DATABASE IF EXISTS `' . DB_NAME . '`', 'Database dihapus');
$conn->close();

// Buat ulang database, tabel, dan admin awal
require __DIR__ . '/main.php';
