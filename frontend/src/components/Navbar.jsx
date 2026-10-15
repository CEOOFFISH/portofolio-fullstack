// frontend/src/components/Navbar.jsx
// Bilah navigasi halaman publik: judul, tautan antar bagian, tombol tema, dan tombol login admin.
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const links = [
  { href: '#pendidikan', label: 'Pendidikan' },
  { href: '#pengalaman', label: 'Pengalaman' },
  { href: '#keahlian', label: 'Keahlian' },
  { href: '#karya', label: 'Karya' },
  { href: '#kontak', label: 'Kontak' },
];

const Navbar = () => {
  const { token } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a className="brand" href="#top">
          Portofolio Pribadi
        </a>

        <nav className="nav-links" aria-label="Navigasi bagian halaman">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button type="button" className="button" onClick={toggleTheme} aria-label="Ganti tema terang/gelap">
            {theme === 'light' ? '☀ Light' : '☾ Dark'}
          </button>
          {token ? (
            <Link className="button accent" to="/dashboard">
              Ke Dashboard
            </Link>
          ) : (
            <Link className="button accent" to="/login">
              Login Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
