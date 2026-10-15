<?php
// backend/src/public.php
// GET /public  (tanpa login)
// Mengumpulkan data dari 6 tabel dalam satu respons untuk halaman portofolio publik.

require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/commonfunction.php';

requireMethod(['GET']);
require_once __DIR__ . '/../library/dbconnection.php';

$queries = [
    'profil'             => 'SELECT nama_lengkap, email, nomor_hp, foto FROM users ORDER BY created_at ASC, id ASC LIMIT 1',
    'riwayat_pendidikan' => 'SELECT id, nama_institusi, tingkat, jurusan, tahun_mulai, tahun_selesai FROM riwayat_pendidikan ORDER BY tahun_mulai DESC, id DESC',
    'pengalaman'         => 'SELECT id, nama_perusahaan, jabatan, tahun_mulai, tahun_selesai FROM pengalaman ORDER BY tahun_mulai DESC, id DESC',
    'kontak_aktif'       => 'SELECT id, nama_media, url FROM kontak_aktif ORDER BY created_at ASC, id ASC',
    'keahlian'           => 'SELECT id, nama_keahlian, level FROM keahlian ORDER BY created_at ASC, id ASC',
    'karya_terbaik'      => 'SELECT id, nama_karya, deskripsi, url FROM karya_terbaik ORDER BY created_at DESC, id DESC',
];

$response = ['status' => 'success', 'data' => []];

foreach ($queries as $key => $query) {
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($key === 'profil') {
        $response['data'][$key] = $result->fetch_assoc() ?: null;
    } else {
        $response['data'][$key] = $result->fetch_all(MYSQLI_ASSOC);
    }
    $stmt->close();
}

jsonResponse(200, $response);
