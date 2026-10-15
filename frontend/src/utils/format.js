// frontend/src/utils/format.js
// Fungsi kecil pembantu tampilan dan validasi.
import nofoto from '../assets/nofoto.svg';
import { BASE_URL } from '../api/backendApi';

// Alamat foto profil. Foto kosong / "default.png" -> gambar placeholder.
export const fotoUrl = (foto) => {
  if (!foto || foto === 'default.png') return nofoto;
  return `${BASE_URL}/uploads/${encodeURIComponent(foto)}`;
};

export const NOFOTO = nofoto;

// Jika gambar gagal dimuat, ganti placeholder (sekali saja agar tidak berulang tanpa henti)
export const handleImageError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = nofoto;
};

// "2020 - 2024" atau "2022 - Sekarang" (tahun selesai 0 = masih berjalan)
export const formatPeriod = (mulai, selesai) => `${mulai} - ${Number(selesai) ? selesai : 'Sekarang'}`;

// Hanya izinkan tautan http, https, mailto agar tidak ada "javascript:" yang berbahaya
export const safeUrl = (url) => {
  const value = String(url || '').trim();
  return /^(https?:\/\/|mailto:)/i.test(value) ? value : '#';
};

// Level keahlian -> persentase batang
export const levelPercent = (level) => {
  const map = { beginner: 25, intermediate: 50, advanced: 75, expert: 100 };
  return map[String(level || '').toLowerCase()] ?? 50;
};

// Validasi rentang tahun untuk Pendidikan & Pengalaman. Mengembalikan objek error per field.
export const validateYearRange = (form) => {
  const errors = {};
  const mulai = Number(form.tahun_mulai);
  const selesai = Number(form.tahun_selesai);
  if (Number.isInteger(selesai) && selesai !== 0) {
    if (selesai < 1900 || selesai > 2100) {
      errors.tahun_selesai = 'Tahun selesai harus 1900-2100 (atau 0 jika masih berjalan)';
    } else if (Number.isInteger(mulai) && selesai < mulai) {
      errors.tahun_selesai = 'Tahun selesai tidak boleh lebih kecil dari tahun mulai';
    }
  }
  return errors;
};

// Cek URL di sisi frontend (backend tetap memvalidasi ulang)
export const isValidUrl = (value, allowMailto = false) => {
  const v = String(value || '').trim();
  if (allowMailto && /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(v)) return true;
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};
