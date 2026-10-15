// frontend/src/api/backendApi.js
// Pusat semua pemanggilan REST API. Komponen TIDAK boleh memanggil axios langsung.
import axios from 'axios';

// Alamat backend: ubah lewat file .env (VITE_API_URL)
export const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

// Jeda singkat agar animasi loading tidak "berkedip" terlalu cepat
export const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const backendApi = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

// Setiap request otomatis membawa token di header: Authorization: Bearer <token>
backendApi.interceptors.request.use((config) => {
  let token = null;
  try {
    token = localStorage.getItem('token');
  } catch {
    token = null;
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Jika server menjawab 401 (token salah/kedaluwarsa), beri tahu AuthContext agar sesi dibersihkan
backendApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.url !== '/login') {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Mengubah error Axios menjadi pesan yang mudah dibaca pengguna
export const getErrorMessage = (error, fallback = 'Terjadi kesalahan, silakan coba lagi.') => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ERR_NETWORK' || error?.code === 'ECONNABORTED') {
    return `Tidak dapat terhubung ke server backend (${BASE_URL}). Pastikan backend dan MySQL sudah berjalan.`;
  }
  return fallback;
};

// ==================== AUTENTIKASI ====================
export const LoginApi = (username, password) => backendApi.post('/login', { username, password });
export const LogoutApi = () => backendApi.post('/logout');
export const VerifyLoginApi = () => backendApi.get('/verify_login');

// ==================== PUBLIK ====================
export const GetPublic = () => backendApi.get('/public');

// ==================== BIODATA ====================
export const GetUser = () => backendApi.get('/users');
// formData bertipe FormData (berisi teks + file foto); Axios mengatur Content-Type otomatis
export const UpdateUser = (formData) => backendApi.post('/users', formData);

// ==================== CRUD (pola seragam) ====================
// path    : nama endpoint, listKey : nama properti array pada respons backend
const makeCrud = (path, listKey) => ({
  list: async () => {
    const res = await backendApi.get(path);
    return res.data[listKey] || [];
  },
  add: (data) => backendApi.post(path, data),
  update: (data) => backendApi.put(path, data),
  remove: (id) => backendApi.delete(path, { params: { id } }),
});

export const pendidikanApi = makeCrud('/pendidikan', 'riwayat_pendidikan');
export const pengalamanApi = makeCrud('/pengalaman', 'pengalaman');
export const keahlianApi = makeCrud('/keahlian', 'keahlian');
export const kontakApi = makeCrud('/kontak', 'kontak_aktif');
export const karyaApi = makeCrud('/karya', 'karya_terbaik');

export default backendApi;
