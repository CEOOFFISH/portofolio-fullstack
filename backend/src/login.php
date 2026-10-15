<?php
// backend/src/login.php
// POST /login  body JSON: { "username": "...", "password": "..." }
// Berhasil -> { status, message, user, token }

require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/commonfunction.php';

requireMethod(['POST']);
require_once __DIR__ . '/../library/dbconnection.php';

$data     = readInput();
$username = inputString($data, 'username');
$password = inputString($data, 'password');

if ($username === '' || $password === '') {
    jsonError(400, 'Username dan password tidak boleh kosong.');
}

$stmt = $conn->prepare('SELECT id, username, nama_lengkap, `password` FROM users WHERE username = ? LIMIT 1');
$stmt->bind_param('s', $username);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row || !password_verify($password, $row['password'])) {
    // Pesan sengaja sama untuk username salah maupun password salah
    jsonError(401, 'Username atau password salah.');
}

// Token acak 64 karakter heksadesimal. Ke klien dikirim token asli,
// ke database disimpan hash-nya saja.
$token  = bin2hex(random_bytes(32));
$hashed = hashToken($token);

$update = $conn->prepare('UPDATE users SET token = ? WHERE id = ? LIMIT 1');
$update->bind_param('si', $hashed, $row['id']);
$update->execute();
$update->close();

jsonResponse(200, [
    'status'  => 'success',
    'message' => 'Login berhasil',
    'user'    => [
        'id'           => (int) $row['id'],
        'username'     => $row['username'],
        'nama_lengkap' => $row['nama_lengkap'],
    ],
    'token'   => $token,
]);
