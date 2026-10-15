<?php
// backend/migration/main.php
// Menyiapkan database, tabel, dan akun admin awal.
// AMAN dijalankan berulang kali: tidak menghapus database/data yang sudah ada.
// Jalankan dari folder backend/ :   php migration/main.php

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Skrip migrasi hanya boleh dijalankan lewat terminal.');
}

define('ALLOW_NO_DB', true); // database mungkin belum ada saat migrasi pertama

require_once __DIR__ . '/../library/commonfunction.php';
require_once __DIR__ . '/../library/dbconnection.php';

// 1. Buat database (jika belum ada)
executeQuery(
    'CREATE DATABASE IF NOT EXISTS `' . DB_NAME . '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
    'Database "' . DB_NAME . '" siap'
);
$conn->select_db(DB_NAME);

// 2. Tabel users
executeQuery('CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(255) NOT NULL,
    nomor_hp VARCHAR(255) NOT NULL,
    foto VARCHAR(255) NOT NULL,
    token VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4', 'Tabel users siap');

// 3. Tabel riwayat_pendidikan
executeQuery('CREATE TABLE IF NOT EXISTS riwayat_pendidikan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_institusi VARCHAR(255) NOT NULL,
    tingkat VARCHAR(255) NOT NULL,
    jurusan VARCHAR(255) NOT NULL,
    tahun_mulai INT NOT NULL,
    tahun_selesai INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4', 'Tabel riwayat_pendidikan siap');

// 4. Tabel pengalaman
executeQuery('CREATE TABLE IF NOT EXISTS pengalaman (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_perusahaan VARCHAR(255) NOT NULL,
    jabatan VARCHAR(255) NOT NULL,
    tahun_mulai INT NOT NULL,
    tahun_selesai INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4', 'Tabel pengalaman siap');

// 5. Tabel kontak_aktif
executeQuery('CREATE TABLE IF NOT EXISTS kontak_aktif (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_media VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4', 'Tabel kontak_aktif siap');

// 6. Tabel keahlian
executeQuery('CREATE TABLE IF NOT EXISTS keahlian (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_keahlian VARCHAR(255) NOT NULL,
    level VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4', 'Tabel keahlian siap');

// 7. Tabel karya_terbaik
executeQuery('CREATE TABLE IF NOT EXISTS karya_terbaik (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_karya VARCHAR(255) NOT NULL,
    deskripsi TEXT NOT NULL,
    url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4', 'Tabel karya_terbaik siap');

// 8. Akun admin awal: hanya dibuat jika belum ada user sama sekali
$count = (int) $conn->query('SELECT COUNT(*) AS total FROM users')->fetch_assoc()['total'];

if ($count === 0) {
    $username = 'admin';
    $email    = 'admin@example.com';
    $hash     = password_hash('admin123', PASSWORD_DEFAULT);
    $nama     = 'Administrator';
    $hp       = '081234567890';
    $foto     = 'default.png';

    $stmt = $conn->prepare(
        'INSERT INTO users (username, email, `password`, nama_lengkap, nomor_hp, foto) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->bind_param('ssssss', $username, $email, $hash, $nama, $hp, $foto);
    $stmt->execute();
    $stmt->close();
    echo '[OK] Akun admin awal dibuat (username: admin, password: admin123)' . PHP_EOL;
} else {
    echo '[SKIP] Akun sudah ada, admin awal tidak dibuat ulang' . PHP_EOL;
}

// 9. Pastikan folder uploads ada
$uploads = __DIR__ . '/../uploads';
if (!is_dir($uploads)) {
    mkdir($uploads, 0755, true);
    echo '[OK] Folder uploads dibuat' . PHP_EOL;
}

$conn->close();
echo PHP_EOL . 'Migrasi selesai. Tidak ada data yang dihapus.' . PHP_EOL;
