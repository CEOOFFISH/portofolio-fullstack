<?php
// backend/src/logout.php
// POST /logout  (header Authorization: Bearer <token>)
// Menghapus token dari database sehingga tidak bisa dipakai lagi.

require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/commonfunction.php';

requireMethod(['POST']);
require_once __DIR__ . '/../library/dbconnection.php';

$userId = verifyToken();

$stmt = $conn->prepare('UPDATE users SET token = NULL WHERE id = ? LIMIT 1');
$stmt->bind_param('i', $userId);
$stmt->execute();
$stmt->close();

jsonResponse(200, ['status' => 'success', 'message' => 'Anda telah logout.']);
