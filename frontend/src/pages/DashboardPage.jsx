// frontend/src/pages/DashboardPage.jsx
// Panel admin dengan 6 tab. Rute ini dibungkus ProtectedRoute di App.jsx.
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Biodata from '../admin/Biodata';
import Pendidikan from '../admin/Pendidikan';
import Pengalaman from '../admin/Pengalaman';
import Keahlian from '../admin/Keahlian';
import Kontak from '../admin/Kontak';
import Karya from '../admin/Karya';

const tabs = [
  { id: 'biodata', label: 'Biodata', Component: Biodata },
  { id: 'pendidikan', label: 'Pendidikan', Component: Pendidikan },
  { id: 'pengalaman', label: 'Pengalaman', Component: Pengalaman },
  { id: 'keahlian', label: 'Keahlian', Component: Keahlian },
  { id: 'kontak', label: 'Kontak', Component: Kontak },
  { id: 'karya', label: 'Karya', Component: Karya },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('biodata');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    document.title = 'Dashboard - Editor Portofolio';
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/login', { replace: true });
  };

  const Active = tabs.find((t) => t.id === activeTab).Component;

  return (
    <div className="container">
      <header className="dash-header">
        <div>
          <h1>Dashboard Portofolio</h1>
          <p className="muted small-text">
            Login sebagai: <strong>{user?.username || 'admin'}</strong>
          </p>
        </div>
        <div className="dash-actions">
          <Link className="button accent" to="/">
            Lihat Portofolio Publik
          </Link>
          <button type="button" className="button" onClick={toggleTheme}>
            Tema: {theme === 'light' ? '☀ Terang' : '☾ Gelap'}
          </button>
          <button type="button" className="button danger" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? 'Keluar...' : 'Logout'}
          </button>
        </div>
      </header>

      <nav className="tabs" aria-label="Menu pengelolaan data">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`button ${activeTab === t.id ? 'primary' : 'accent'}`}
            aria-current={activeTab === t.id ? 'page' : undefined}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <section className="card">
        {/* key: komponen dibuat ulang tiap ganti tab sehingga data selalu dimuat segar dari database */}
        <Active key={activeTab} />
      </section>
    </div>
  );
};

export default DashboardPage;
