<?php
// backend/library/dbconnection.php
// Membuka koneksi ke MySQL/MariaDB. Pengaturan bisa diubah di sini
// atau lewat environment variable (DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME).

// Setiap error mysqli akan dilempar sebagai Exception (ditangkap handler di commonfunction.php)
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', (int) (getenv('DB_PORT') ?: 3306));
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : ''); // XAMPP default: kosong
define('DB_NAME', getenv('DB_NAME') ?: 'portofolio');

// Koneksi ke server MySQL (belum memilih database)
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, '', DB_PORT);
$conn->set_charset('utf8mb4');

// Pilih database target.
// Skrip migrasi mendefinisikan ALLOW_NO_DB karena database mungkin belum ada.
try {
    $conn->select_db(DB_NAME);
} catch (mysqli_sql_exception $e) {
    if (!defined('ALLOW_NO_DB')) {
        throw $e;
    }
}
