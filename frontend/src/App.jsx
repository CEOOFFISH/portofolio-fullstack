// frontend/src/App.jsx
// Provider global (tema, autentikasi) + daftar rute halaman.
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicPage from './pages/PublicPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LogoutPage from './pages/LogoutPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Routes>
            <Route path="/" element={<PublicPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
