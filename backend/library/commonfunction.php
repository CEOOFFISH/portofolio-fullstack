<?php
// backend/library/commonfunction.php
// Fungsi bantu yang dipakai semua endpoint.
// WAJIB di-require SEBELUM dbconnection.php agar penanganan error aktif.

// ---------------------------------------------------------------
// Penanganan error global: detail error tidak dibocorkan ke klien
// ---------------------------------------------------------------
if (PHP_SAPI !== 'cli') {
    ini_set('display_errors', '0');
}

set_exception_handler(function (Throwable $e) {
    error_log('[portofolio] ' . $e->getMessage());

    if (PHP_SAPI === 'cli') {
        fwrite(STDERR, 'Error: ' . $e->getMessage() . PHP_EOL);
        exit(1);
    }

    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode([
        'status'  => 'error',
        'message' => 'Terjadi kesalahan pada server. Pastikan MySQL aktif dan database sudah dibuat (php migration/main.php).',
    ]);
});

// ---------------------------------------------------------------
// Respons JSON seragam
// ---------------------------------------------------------------
function jsonResponse(int $code, array $payload): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonError(int $code, string $message): void
{
    jsonResponse($code, ['status' => 'error', 'message' => $message]);
}

// Hanya izinkan method tertentu
function requireMethod(array $allowed): void
{
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($method, $allowed, true)) {
        header('Allow: ' . implode(', ', $allowed));
        jsonError(405, 'Method ' . $method . ' tidak diizinkan untuk endpoint ini.');
    }
}

// ---------------------------------------------------------------
// Membaca input: JSON body atau form-data/x-www-form-urlencoded
// ---------------------------------------------------------------
function readInput(): array
{
    $data = [];
    $raw = file_get_contents('php://input');
    if ($raw !== false && $raw !== '') {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            $data = $decoded;
        }
    }
    if (!$data && !empty($_POST)) {
        $data = $_POST;
    }
    return $data;
}

// Ambil nilai teks yang sudah di-trim (selalu string)
function inputString(array $data, string $key): string
{
    $value = $data[$key] ?? '';
    return is_scalar($value) ? trim((string) $value) : '';
}

// ---------------------------------------------------------------
// Query untuk skrip migrasi (CLI)
// ---------------------------------------------------------------
function executeQuery(string $query, string $message = ''): void
{
    global $conn;
    $conn->query($query); // error otomatis dilempar sebagai exception
    if ($message !== '') {
        echo '[OK] ' . $message . PHP_EOL;
    }
}

// ---------------------------------------------------------------
// Autentikasi token (header "Authorization: Bearer <token>")
// ---------------------------------------------------------------
function getBearerToken(): string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';

    if ($header === '' && function_exists('getallheaders')) {
        foreach (getallheaders() as $name => $value) {
            if (strcasecmp($name, 'Authorization') === 0) {
                $header = $value;
                break;
            }
        }
    }

    if (preg_match('/^Bearer\s+(\S+)$/i', trim($header), $m)) {
        return $m[1];
    }
    return '';
}

// Token disimpan di database dalam bentuk hash SHA-256 (bukan teks asli).
function hashToken(string $token): string
{
    return hash('sha256', $token);
}

// Memeriksa token. Jika tidak valid -> respons 401 dan script berhenti.
// Mengembalikan id user yang sedang login.
function verifyToken(?string $token = null): int
{
    global $conn;

    if ($token === null) {
        $token = getBearerToken();
    }
    if ($token === '') {
        jsonError(401, 'Silakan login terlebih dahulu.');
    }

    $hashed = hashToken($token);
    $stmt = $conn->prepare('SELECT id FROM users WHERE token = ? LIMIT 1');
    $stmt->bind_param('s', $hashed);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$row) {
        jsonError(401, 'Token tidak valid atau sesi sudah berakhir.');
    }
    return (int) $row['id'];
}

// ---------------------------------------------------------------
// Validasi
// ---------------------------------------------------------------
// Cek apakah baris dengan id tertentu ada (nama tabel di-whitelist)
function rowExists(string $table, int $id): bool
{
    global $conn;
    $allowed = ['riwayat_pendidikan', 'pengalaman', 'keahlian', 'karya_terbaik', 'kontak_aktif'];
    if (!in_array($table, $allowed, true)) {
        throw new InvalidArgumentException('Tabel tidak dikenal');
    }
    $stmt = $conn->prepare("SELECT id FROM `$table` WHERE id = ? LIMIT 1");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $found = $stmt->get_result()->num_rows === 1;
    $stmt->close();
    return $found;
}

// Tahun mulai wajib 1900-2100. Tahun selesai 0 berarti "masih berjalan / sekarang".
function validateYears(int $mulai, int $selesai): ?string
{
    if ($mulai < 1900 || $mulai > 2100) {
        return 'Tahun mulai harus antara 1900 dan 2100.';
    }
    if ($selesai !== 0 && ($selesai < 1900 || $selesai > 2100)) {
        return 'Tahun selesai harus antara 1900 dan 2100 (atau 0 jika masih berjalan).';
    }
    if ($selesai !== 0 && $selesai < $mulai) {
        return 'Tahun selesai tidak boleh lebih kecil dari tahun mulai.';
    }
    return null;
}

// Hanya menerima http/https (dan mailto jika diizinkan) agar tidak ada URL "javascript:"
function validateUrl(string $url, bool $allowMailto = false): bool
{
    if (strlen($url) > 255) {
        return false;
    }
    if ($allowMailto && preg_match('/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i', $url)) {
        return true;
    }
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return false;
    }
    $scheme = strtolower((string) parse_url($url, PHP_URL_SCHEME));
    return in_array($scheme, ['http', 'https'], true);
}

// Validasi panjang teks (karakter, bukan byte)
function tooLong(string $value, int $max = 255): bool
{
    return mb_strlen($value, 'UTF-8') > $max;
}
