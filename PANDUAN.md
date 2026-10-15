# Portofolio Pribadi — Panduan Menyatukan & Menjalankan

Aplikasi web portofolio: **React 19 + Vite** (frontend), **PHP Native 8+** (backend REST API), **MySQL/MariaDB** (database).
Dibuat berdasarkan dokumen *"14. Praktik Backend-Frontend.pdf"* (Insan Taufik, S.Kom., M.Kom — Pemrograman Web Modern).

---

## 1. Struktur folder (susun persis seperti ini)

```
portofolio/
├── PANDUAN.md
├── backend/
│   ├── index.php
│   ├── uploads/
│   │   ├── .htaccess
│   │   └── .gitkeep
│   ├── library/
│   │   ├── dbconnection.php
│   │   ├── cors.php
│   │   └── commonfunction.php
│   ├── migration/
│   │   ├── main.php
│   │   └── reset.php
│   └── src/
│       ├── login.php
│       ├── verify_login.php
│       ├── logout.php
│       ├── public.php
│       ├── users.php
│       ├── pendidikan.php
│       ├── pengalaman.php
│       ├── keahlian.php
│       ├── karya.php
│       └── kontak.php
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── .env                  (salinan dari .env.example)
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── App.css
        ├── assets/nofoto.svg
        ├── api/backendApi.js
        ├── utils/format.js
        ├── context/  AuthContext.jsx  ThemeContext.jsx
        ├── components/  Navbar.jsx  Footer.jsx  Loading.jsx  Modal.jsx  Alert.jsx
        │                ProtectedRoute.jsx  CrudManager.jsx
        ├── pages/  PublicPage.jsx  LoginPage.jsx  DashboardPage.jsx  LogoutPage.jsx
        └── admin/  Biodata.jsx  Pendidikan.jsx  Pengalaman.jsx  Keahlian.jsx  Kontak.jsx  Karya.jsx
```

Cara termudah: **ekstrak `portofolio.zip`** — semua folder di atas langsung tersusun.
Jika menyalin file satu per satu, buat folder-foldernya dulu, lalu letakkan tiap file sesuai path pada keterangan file.

> Contoh lokasi di Windows: `C:\praktik\portofolio\`

---

## 2. Software yang perlu dipasang

| Software | Versi | Fungsi |
|---|---|---|
| XAMPP | PHP 8.0+ (bawaan XAMPP terbaru) | Menyediakan **MySQL/MariaDB** dan **PHP** |
| Node.js | 18 atau 20+ (LTS) | Menjalankan Vite & npm |
| VS Code | terbaru | Editor kode |
| Browser | Chrome / Edge / Firefox | Menguji aplikasi |

Cek di terminal VS Code (`Ctrl + ~`):

```bash
node -v
npm -v
php -v
```

**Jika `php` tidak dikenali di Windows:** PHP bawaan XAMPP ada di `C:\xampp\php\php.exe`.
Dua pilihan: (a) tambahkan `C:\xampp\php` ke *Environment Variables → Path*, lalu tutup & buka ulang VS Code; atau
(b) tulis perintahnya lengkap, mis. `C:\xampp\php\php.exe -v`.

---

## 3. Langkah menjalankan (urut)

### Langkah 1 — Nyalakan MySQL
Buka **XAMPP Control Panel** → klik **Start** pada **MySQL**. (Apache **tidak** diperlukan.)

### Langkah 2 — Buat database & akun admin (sekali saja)
Terminal di VS Code, **di folder `backend`**:

```bash
cd backend
php migration/main.php
```

Hasil yang benar:

```
[OK] Database "portofolio" siap
[OK] Tabel users siap
... (6 tabel)
[OK] Akun admin awal dibuat (username: admin, password: admin123)
Migrasi selesai. Tidak ada data yang dihapus.
```

Skrip ini **aman dijalankan berulang kali**: tidak menghapus data. Jika dijalankan lagi akan tampil `[SKIP] Akun sudah ada`.

> Jika MySQL Anda memakai password untuk `root`, atur dulu (PowerShell):
> `$env:DB_PASS="password_anda"` — lalu jalankan perintah migrasi dan server di terminal yang sama.
> Variabel lain yang bisa diubah: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_NAME`. Atau edit langsung `backend/library/dbconnection.php`.

### Langkah 3 — Jalankan backend
Masih di folder `backend` (**biarkan terminal ini terbuka**):

```bash
php -d upload_max_filesize=6M -d post_max_size=8M -S localhost:8000 index.php
```

Penjelasan singkat:
- `-S localhost:8000` = menjalankan server bawaan PHP di port 8000.
- `index.php` di belakang = *router script*; semua permintaan lewat pintu tunggal ini, sehingga file lain (mis. `library/*.php`) tidak bisa dibuka langsung dari URL.
- `-d upload_max_filesize=6M -d post_max_size=8M` = agar foto sampai 5 MB bisa diunggah (bawaan PHP hanya 2 MB).

Uji: buka **http://localhost:8000/public** di browser. Harus tampil JSON `{"status":"success","data":{...}}`.

### Langkah 4 — Jalankan frontend
Buka **terminal baru** (ikon `+` di panel terminal VS Code), **di folder `frontend`**:

```bash
cd frontend
npm install
npm run dev
```

Buka **http://localhost:5173** di browser.

Alamat backend diatur di `frontend/.env`:

```
VITE_API_URL=http://localhost:8000
```

Jika diubah, **hentikan (`Ctrl+C`) dan jalankan ulang `npm run dev`**.

### Langkah 5 — Login
Klik **Login Admin** → username `admin`, password `admin123`.
(Segera ganti password lewat Dashboard → Biodata → Edit Biodata.)

### URL ringkas

| Apa | Alamat |
|---|---|
| Aplikasi (frontend) | http://localhost:5173 |
| Halaman login | http://localhost:5173/login |
| Dashboard admin | http://localhost:5173/dashboard |
| API backend | http://localhost:8000 |
| Data publik (JSON) | http://localhost:8000/public |

### Build produksi (opsional)

```bash
cd frontend
npm run build      # hasil di folder dist/
npm run preview    # uji hasil build di komputer lokal
```

---

## 4. Daftar endpoint API

Token dikirim di header `Authorization: Bearer <token>` (bukan di URL).

| Method | Endpoint | Login? | Fungsi |
|---|---|---|---|
| POST | `/login` | tidak | body JSON `username`, `password` → mengembalikan `token` |
| GET/POST | `/verify_login` | ya | cek token masih berlaku |
| POST | `/logout` | ya | hapus token di database |
| GET | `/public` | tidak | semua data portofolio (6 tabel) |
| GET | `/users` | ya | profil admin |
| POST | `/users` | ya | ubah profil + foto + password (`multipart/form-data`) |
| GET / POST / PUT / DELETE | `/pendidikan` `/pengalaman` `/keahlian` `/karya` `/kontak` | ya | CRUD. DELETE: `/karya?id=3` |

Format respons: `{ "status": "success" | "error", "message": "...", ...data }`.
Kode status: 200/201 sukses, 400 input salah, 401 belum login/token salah, 404 tidak ditemukan, 405 method salah, 409 username dipakai, 413 file terlalu besar, 415 format file salah, 500 error server (tanpa detail internal).

### Contoh uji dengan cURL (Command Prompt / Git Bash)

```bash
curl http://localhost:8000/public

curl -X POST http://localhost:8000/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}"

curl -X POST http://localhost:8000/keahlian -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN_DARI_LOGIN" -d "{\"nama_keahlian\":\"React.js\",\"level\":\"Intermediate\"}"
```

---

## 5. Checklist pengujian

Centang satu per satu setelah aplikasi berjalan:

**Publik**
- [ ] Halaman `/` memuat data (ada spinner "Memuat portofolio..." sebentar).
- [ ] Foto, nama, email, nomor HP tampil. Foto default = siluet abu-abu sampai Anda upload.
- [ ] Bagian Pendidikan, Pengalaman, Keahlian, Karya, Kontak tampil; yang kosong menampilkan teks "Belum ada ...".
- [ ] Tombol **Light/Dark** mengganti tema; **refresh halaman** → tema tetap (tersimpan di localStorage).
- [ ] Tampilan rapi di layar kecil (perkecil jendela browser / mode ponsel di DevTools `F12`).
- [ ] Matikan backend lalu refresh → muncul pesan error + tombol "Coba Lagi".

**Login & sesi**
- [ ] Submit kosong → pesan "wajib diisi".
- [ ] Password salah → notifikasi merah "Username atau password salah."
- [ ] `admin` / `admin123` → notifikasi hijau, pindah ke Dashboard.
- [ ] Buka `/dashboard` tanpa login (mode incognito) → dialihkan ke `/login`.
- [ ] Refresh di Dashboard → tetap login.
- [ ] **Logout** → kembali ke login; tombol Back browser lalu `/dashboard` → tetap ditolak.
- [ ] Tautan **« Kembali** di login menuju halaman publik.

**Dashboard — Biodata**
- [ ] Edit nama/email/HP → tersimpan, tampil setelah dimuat ulang.
- [ ] Upload foto JPG/PNG/WEBP ≤ 5 MB → foto baru tampil di Dashboard dan halaman publik; file muncul di `backend/uploads/` dengan nama acak.
- [ ] File `.txt`/`.gif` atau > 5 MB ditolak dengan pesan jelas.
- [ ] Ganti password → logout → login dengan password baru berhasil.

**Dashboard — Pendidikan, Pengalaman, Keahlian, Kontak, Karya** (ulangi untuk tiap tab)
- [ ] **+ Tambah Data** → isi form → muncul di tabel & halaman publik.
- [ ] Validasi: field kosong, tahun selesai < tahun mulai, URL tanpa `https://` → pesan merah di bawah field.
- [ ] **Edit** → perubahan tersimpan.
- [ ] **Hapus** → muncul konfirmasi → data hilang dari tabel & halaman publik.
- [ ] Cek di **phpMyAdmin** (`http://localhost/phpmyadmin`, butuh Apache XAMPP aktif) bahwa isi tabel berubah.
- [ ] Kolom `password` di tabel `users` berisi hash (`$2y$...`), bukan `admin123`.

---

## 6. Solusi error yang umum

| Gejala | Penyebab | Solusi |
|---|---|---|
| `'php' is not recognized` | PHP belum di PATH | Tambah `C:\xampp\php` ke Path atau pakai `C:\xampp\php\php.exe` |
| Migrasi: `Connection refused` / `No connection could be made` | MySQL belum menyala | XAMPP Control Panel → Start MySQL |
| Migrasi: `Access denied for user 'root'` | root MySQL punya password | `$env:DB_PASS="..."` atau edit `dbconnection.php` |
| `Class "mysqli" not found` | Ekstensi mysqli mati | Di `php.ini` pastikan `extension=mysqli` tanpa tanda `;` di depannya, restart terminal |
| Upload foto: `Class "finfo" not found` | Ekstensi fileinfo mati | Di `php.ini` aktifkan `extension=fileinfo` |
| Browser: **Network Error** / "Tidak dapat terhubung ke server backend" | Backend tidak jalan, port salah | Pastikan Langkah 3 aktif; cek `VITE_API_URL` di `frontend/.env`, restart `npm run dev` |
| Respons 500 "Terjadi kesalahan pada server..." | MySQL mati atau migrasi belum dijalankan | Start MySQL, jalankan `php migration/main.php`. Detail asli ada di terminal backend |
| `Address already in use` (port 8000) | Port dipakai program lain | Pakai `-S localhost:8001` dan ubah `VITE_API_URL` jadi `http://localhost:8001` |
| Login berhasil tapi langsung terlempar ke login | Token ditolak (mis. login di tempat lain mengganti token) | Login ulang. Sistem ini satu sesi aktif per akun |
| Foto > 2 MB gagal upload | Batas bawaan PHP 2 MB | Jalankan backend dengan opsi `-d upload_max_filesize=6M -d post_max_size=8M` |
| Foto tidak muncul | Backend mati / file terhapus | Pastikan backend jalan; cek file ada di `backend/uploads/` |
| `npm : File ... cannot be loaded because running scripts is disabled` (PowerShell) | Execution policy | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, atau pakai Command Prompt |
| `npm install` gagal karena versi paket tidak ditemukan | Versi di `package.json` tidak tersedia di registry Anda | Jalankan `npm install -D vite@latest @vitejs/plugin-react@latest` |
| Halaman putih | Error JavaScript | Tekan `F12` → tab Console, baca pesan merahnya |
| Ubah `.env` tapi tidak berpengaruh | Vite membaca `.env` saat start | `Ctrl+C` lalu `npm run dev` lagi |

**Reset database total (khusus pengembangan, MENGHAPUS SEMUA DATA):**

```bash
cd backend
php migration/reset.php
```
Skrip meminta Anda mengetik nama database (`portofolio`) sebagai persetujuan; tekan Enter saja untuk membatalkan.

---

## 7. Perubahan penting dibanding kode contoh di PDF

PDF dijadikan acuan utama (teknologi, nama tabel & kolom, endpoint, alur). Beberapa bagian contoh diperbaiki agar benar-benar berfungsi dan aman:

1. **Migrasi tidak lagi `DROP DATABASE`.** Di PDF, setiap migrasi menghapus seluruh database. Sekarang memakai `CREATE ... IF NOT EXISTS` dan admin hanya dibuat bila belum ada user. Reset dipisah ke `migration/reset.php` dengan konfirmasi manual.
2. **Token lewat header `Authorization: Bearer`**, bukan di URL/body, dan **disimpan di database dalam bentuk hash SHA-256** (token asli hanya ada di browser).
3. **Router `index.php`**: contoh PDF menyajikan *file apa pun* di folder backend (termasuk kode PHP sumber) sebagai berkas statis. Sekarang hanya gambar di `uploads/` yang disajikan, endpoint memakai daftar putih, dan backend dijalankan dengan router script (`php -S ... index.php`).
4. **Format respons seragam** `status` + `message`. PDF mencampur `pesan` dan `message`, padahal frontend hanya membaca `message` — pesan error dari backend tidak akan tampil.
5. **DELETE memakai `?id=`** (query string) dan diperiksa: ID tidak valid → 400, data tak ada → 404.
6. **Validasi input di backend** untuk semua modul (kosong, panjang, rentang tahun, URL hanya http/https/mailto, format email & nomor HP, username unik, level keahlian).
7. **Upload foto**: ditambah cek `getimagesize`, penanganan `UPLOAD_ERR_INI_SIZE`, hapus foto lama otomatis, `uploads/.htaccess` agar skrip tidak dieksekusi (jika memakai Apache).
8. **Error server tidak membocorkan detail** (PDF memakai `die($conn->error)`). Detail hanya masuk log server.
9. **Frontend**: `Logout.jsx` PDF memanggil `logout()` di `useEffect` dengan dependensi yang berubah tiap render (berpotensi berulang) — diperbaiki. `Dashboard` kini dilindungi `ProtectedRoute` yang juga memverifikasi token ke `/verify_login`. CSS PDF memakai animasi `fadeIn` tanpa mendefinisikannya — sudah ditambahkan.
10. **Modul admin Pendidikan/Pengalaman/Keahlian/Kontak** hanya disebut "serupa Karya.jsx" di PDF tanpa kodenya. Dibuat satu komponen generik `CrudManager.jsx`; tiap modul tinggal berisi konfigurasi kolom/isian.
11. **Nama berkas frontend** mengikuti susunan di brief tugas (`PublicPage.jsx`, `LoginPage.jsx`, `DashboardPage.jsx`, folder `admin/`), bukan `Public.jsx`/`Login.jsx` milik PDF. `Button.jsx` PDF tidak dipakai (tombol memakai kelas CSS). Placeholder foto berupa `nofoto.svg` (PDF: `nofoto.jpg`).

### Asumsi (tidak ada di PDF)
- **Tahun selesai `0` = "Sekarang"** (masih berjalan), karena kolom database `NOT NULL`.
- **Level keahlian**: Beginner, Intermediate, Advanced, Expert (PDF hanya memberi contoh tiga yang pertama). Persentase batang: 25/50/75/100%.
- Kolom `users.username` dibuat `UNIQUE`; kolom `users.token` berisi hash.
- Satu akun admin, satu sesi aktif (login baru menggantikan token lama).
- Token tidak punya masa kedaluwarsa otomatis; berakhir saat logout atau login ulang.

---

## 8. Ringkasan hasil pengujian & keterbatasan

**Sudah diuji** (di lingkungan pengembangan ini):
- Sintaks seluruh file PHP (`php -l`) — lolos.
- Backend dijalankan dengan `php -S`: routing, 404, 405, CORS/preflight `OPTIONS`, file internal (`/library/*`, `/migration/*`) tidak bisa dibuka lewat URL, dan error server tidak membocorkan detail — sesuai harapan.
- Fungsi validasi (rentang tahun, URL, pembacaan token Bearer, hash token, trim input) — lolos.
- Seluruh kode frontend (JSX, semua `import`/`export`, CSS) berhasil dibundel dengan esbuild — tidak ada sintaks atau import yang rusak.

**Belum bisa diuji di sini — mohon dicek dengan checklist di atas:**
- Semua yang membutuhkan **MySQL** (migrasi, login, CRUD, upload foto). Server MySQL tidak dapat dipasang di lingkungan ini.
- `npm install` dan `npm run build` Vite: registry npm tidak dapat dijangkau dari lingkungan ini, jadi build sebenarnya belum dijalankan dan aplikasi belum dilihat di browser. Jika ada error saat `npm run build`, kirimkan pesan lengkapnya.
- Tampilan **belum dibandingkan piksel demi piksel** dengan tangkapan layar di PDF. Tata letak, warna aksen (biru `#007bff`, teal `#17a2b8`, merah untuk logout), judul, tombol, dan urutan tab mengikuti dokumen, tetapi gaya dibuat lebih modern.

**Keterbatasan:** satu admin; tanpa refresh/kedaluwarsa token; CORS dibuka (`*`) untuk pengembangan lokal — untuk produksi isi variabel `CORS_ORIGIN` dengan alamat frontend, gunakan HTTPS, dan ganti password awal `admin123`.
