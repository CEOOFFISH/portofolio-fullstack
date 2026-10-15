// frontend/src/context/AuthContext.jsx
// Menyimpan token & data admin yang sedang login (disinkronkan ke localStorage).
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LogoutApi, VerifyLoginApi } from '../api/backendApi';

const AuthContext = createContext(null);

const safeGet = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => safeGet('token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(safeGet('user') || 'null');
    } catch {
      return null;
    }
  });
  // "ready" = pemeriksaan token ke server selesai (jika ada token tersimpan)
  const [ready, setReady] = useState(() => !safeGet('token'));

  // Hapus sesi dari memori dan browser
  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {
      /* abaikan */
    }
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback((newToken, userData) => {
    try {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch {
      /* abaikan */
    }
    setToken(newToken);
    setUser(userData);
    setReady(true);
  }, []);

  const updateUser = useCallback((changes) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...changes };
      try {
        localStorage.setItem('user', JSON.stringify(next));
      } catch {
        /* abaikan */
      }
      return next;
    });
  }, []);

  // Logout: beritahu server (hapus token di database), lalu bersihkan sesi lokal
  const logout = useCallback(async () => {
    try {
      if (safeGet('token')) await LogoutApi();
    } catch {
      /* tetap lanjut membersihkan sesi lokal */
    } finally {
      clearSession();
    }
  }, [clearSession]);

  // Saat aplikasi dibuka/di-refresh: cek apakah token tersimpan masih valid di server
  useEffect(() => {
    if (!safeGet('token')) return undefined;
    let cancelled = false;

    VerifyLoginApi()
      .then((res) => {
        if (!cancelled && res.data?.user) updateUser(res.data.user);
      })
      .catch((err) => {
        // 401 = token tidak valid. Error jaringan: sesi dipertahankan, halaman akan menampilkan pesan error.
        if (err.response?.status === 401) clearSession();
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [clearSession, updateUser]);

  // Dipicu interceptor Axios ketika ada respons 401 di tengah penggunaan
  useEffect(() => {
    const handler = () => clearSession();
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [clearSession]);

  const value = useMemo(
    () => ({ token, user, ready, login, logout, updateUser }),
    [token, user, ready, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
