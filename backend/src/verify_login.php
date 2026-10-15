<?php
// backend/src/verify_login.php
// GET/POST /verify_login  (header Authorization: Bearer <token>)
// Dipakai frontend saat halaman di-refresh untuk memastikan token masih berlaku.

require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/commonfunction.php';

requireMethod(['GET', 'POST']);
require_once __DIR__ . '/../library/dbconnection.php';

$stmtUserId = verifyToken(); // otomatis menjawab 401 jika tidak valid

$stmt = $conn->prepare('SELECT id, username, nama_lengkap FROM users WHERE id = ? LIMIT 1');
$stmt->bind_param('i', $stmtUserId);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

jsonResponse(200, ['status' => 'success', 'message' => 'Token valid', 'user' => $user]);
