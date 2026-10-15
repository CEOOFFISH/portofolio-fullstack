// frontend/src/pages/LoginPage.jsx
// Formulir login admin -> POST /login
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LoginApi, getErrorMessage } from '../api/backendApi';
import { useAuth } from '../context/AuthContext';
import Alert, { closedAlert } from '../components/Alert';

const LoginPage = () => {
  const { token, ready, login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(closedAlert);
  const timerRef = useRef(null);

  useEffect(() => {
    document.title = 'Login Portofolio';
    return () => clearTimeout(timerRef.current);
  }, []);

  // Jika sudah login, langsung ke dashboard
  if (ready && token) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const found = {};
    if (!username.trim()) found.username = 'Username wajib diisi';
    if (!password) found.password = 'Password wajib diisi';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const res = await LoginApi(username.trim(), password);
      if (res.data?.status === 'success') {
        setAlert({ show: true, type: 'success', message: 'Login berhasil. Mengalihkan ke dashboard...' });
        // Jeda singkat agar pesan sukses sempat terlihat, lalu simpan sesi (otomatis pindah ke dashboard)
        timerRef.current = setTimeout(() => login(res.data.token, res.data.user), 700);
        return;
      }
      setAlert({ show: true, type: 'error', message: res.data?.message || 'Login gagal.' });
    } catch (err) {
      setAlert({ show: true, type: 'error', message: getErrorMessage(err, 'Login gagal, periksa koneksi ke backend.') });
    }
    setSubmitting(false);
  };

  return (
    <div className="login-page">
      <div className="card login-card">
        <form onSubmit={handleSubmit} noValidate>
          <h1 className="login-title">Login Portofolio</h1>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              aria-invalid={errors.username ? 'true' : 'false'}
              disabled={submitting}
            />
            {errors.username && <small className="field-error">{errors.username}</small>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              aria-invalid={errors.password ? 'true' : 'false'}
              disabled={submitting}
            />
            {errors.password && <small className="field-error">{errors.password}</small>}
          </div>

          <button type="submit" className="button primary block" disabled={submitting}>
            {submitting ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <p className="back-link">
          <Link to="/">« Kembali</Link>
        </p>
      </div>
      <Alert alert={alert} setAlert={setAlert} />
    </div>
  );
};

export default LoginPage;
