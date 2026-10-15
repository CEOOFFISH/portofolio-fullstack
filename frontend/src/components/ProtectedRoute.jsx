// frontend/src/components/ProtectedRoute.jsx
// Pembungkus rute admin: tanpa token yang valid, pengguna dialihkan ke /login.
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children }) => {
  const { token, ready } = useAuth();
  const location = useLocation();

  // Tunggu pemeriksaan token ke server selesai
  if (!ready) return <Loading type="fixed" title="Memeriksa sesi login..." />;

  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;

  return children;
};

export default ProtectedRoute;
