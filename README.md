# Portofolio Pribadi (React + PHP + MySQL)

Aplikasi web portofolio pribadi dengan halaman publik, login admin, dan dashboard CRUD.

- **Frontend:** React 19, Vite, React Router, Axios (folder `frontend/`)
- **Backend:** PHP Native 8+, REST API JSON (folder `backend/`)
- **Database:** MySQL / MariaDB

## Menjalankan di komputer lokal

1. Nyalakan MySQL (XAMPP).
2. Backend:
   ```bash
   cd backend
   php migration/main.php
   php -d upload_max_filesize=6M -d post_max_size=8M -S localhost:8000 index.php
   ```
3. Frontend (terminal baru):
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```
4. Buka http://localhost:5173 — login awal `admin` / `admin123` (segera ganti).

Panduan lengkap, checklist pengujian, dan solusi error ada di [PANDUAN.md](PANDUAN.md).

## Deploy

- Frontend dapat di-deploy ke Vercel (Root Directory: `frontend`, variabel `VITE_API_URL` = alamat backend).
- Vercel **tidak** menjalankan PHP/MySQL, jadi backend harus dihosting terpisah.
