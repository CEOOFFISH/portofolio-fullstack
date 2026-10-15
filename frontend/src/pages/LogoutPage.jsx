// frontend/src/pages/LogoutPage.jsx
// Rute /logout: mengakhiri sesi lalu kembali ke halaman login.
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

const LogoutPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // cegah dobel eksekusi (React StrictMode)
    started.current = true;
    logout().finally(() => navigate('/login', { replace: true }));
  }, [logout, navigate]);

  return <Loading type="fixed" title="Keluar..." />;
};

export default LogoutPage;
