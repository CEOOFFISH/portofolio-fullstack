// frontend/src/pages/PublicPage.jsx
// Halaman portofolio publik. Semua data diambil dari backend: GET /public
import { useCallback, useEffect, useState } from 'react';
import { GetPublic, delay, getErrorMessage } from '../api/backendApi';
import { fotoUrl, formatPeriod, handleImageError, levelPercent, safeUrl } from '../utils/format';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import Navbar from '../components/Navbar';

const EmptyText = ({ children }) => <p className="empty-text">{children}</p>;

const PublicPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPublic = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [res] = await Promise.all([GetPublic(), delay(250)]);
      if (res.data?.status === 'success') {
        setData(res.data.data);
      } else {
        setError('Gagal memuat data portofolio.');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat data portofolio.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Portofolio Pribadi';
    fetchPublic();
  }, [fetchPublic]);

  if (loading) return <Loading type="fixed" title="Memuat portofolio..." />;

  if (error) {
    return (
      <div className="container">
        <div className="state-box error page-error">
          <h2>Terjadi Kesalahan</h2>
          <p>{error}</p>
          <button type="button" className="button primary" onClick={fetchPublic}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const profil = data?.profil || {};
  const pendidikan = data?.riwayat_pendidikan || [];
  const pengalaman = data?.pengalaman || [];
  const keahlian = data?.keahlian || [];
  const kontak = data?.kontak_aktif || [];
  const karya = data?.karya_terbaik || [];

  return (
    <>
      <Navbar />
      <main className="container" id="top">
        {/* ===== Profil ===== */}
        <section className="card hero" aria-label="Profil">
          <img className="avatar avatar-lg" src={fotoUrl(profil.foto)} alt={profil.nama_lengkap || 'Foto profil'} onError={handleImageError} />
          <h1>{profil.nama_lengkap || 'Nama Lengkap'}</h1>
          <p className="muted">
            <span aria-hidden="true">✉ </span>
            {profil.email || '-'}
          </p>
          <p className="muted">
            <span aria-hidden="true">☎ </span>
            {profil.nomor_hp || '-'}
          </p>
        </section>

        {/* ===== Pendidikan ===== */}
        <section className="card" id="pendidikan">
          <h2 className="section-title">Riwayat Pendidikan</h2>
          {pendidikan.length === 0 ? (
            <EmptyText>Belum ada riwayat pendidikan.</EmptyText>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Institusi</th>
                    <th>Tingkat</th>
                    <th>Jurusan</th>
                    <th>Tahun</th>
                  </tr>
                </thead>
                <tbody>
                  {pendidikan.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nama_institusi}</td>
                      <td>{p.tingkat}</td>
                      <td>{p.jurusan}</td>
                      <td>{formatPeriod(p.tahun_mulai, p.tahun_selesai)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ===== Pengalaman ===== */}
        <section className="card" id="pengalaman">
          <h2 className="section-title">Pengalaman Kerja / Organisasi</h2>
          {pengalaman.length === 0 ? (
            <EmptyText>Belum ada pengalaman kerja atau organisasi.</EmptyText>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Perusahaan / Organisasi</th>
                    <th>Jabatan</th>
                    <th>Tahun</th>
                  </tr>
                </thead>
                <tbody>
                  {pengalaman.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nama_perusahaan}</td>
                      <td>{p.jabatan}</td>
                      <td>{formatPeriod(p.tahun_mulai, p.tahun_selesai)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ===== Keahlian ===== */}
        <section className="card" id="keahlian">
          <h2 className="section-title">Keahlian &amp; Kemampuan</h2>
          {keahlian.length === 0 ? (
            <EmptyText>Belum ada data keahlian.</EmptyText>
          ) : (
            <ul className="skill-list">
              {keahlian.map((k) => (
                <li key={k.id} className="skill-item">
                  <div className="skill-head">
                    <strong>{k.nama_keahlian}</strong>
                    <span className="skill-level">{k.level}</span>
                  </div>
                  <div className="skill-bar" role="img" aria-label={`${k.nama_keahlian}: ${k.level}`}>
                    <div className="skill-bar-fill" style={{ width: `${levelPercent(k.level)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ===== Karya ===== */}
        <section className="card" id="karya">
          <h2 className="section-title">Karya Terbaik &amp; Proyek</h2>
          {karya.length === 0 ? (
            <EmptyText>Belum ada karya yang ditampilkan.</EmptyText>
          ) : (
            <div className="project-grid">
              {karya.map((k) => (
                <article key={k.id} className="project-card">
                  <h3>{k.nama_karya}</h3>
                  <p className="muted">{k.deskripsi}</p>
                  <a href={safeUrl(k.url)} target="_blank" rel="noreferrer noopener">
                    Lihat Proyek ↗
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ===== Kontak ===== */}
        <section className="card" id="kontak">
          <h2 className="section-title">Kontak &amp; Media Sosial</h2>
          {kontak.length === 0 ? (
            <EmptyText>Belum ada kontak yang ditampilkan.</EmptyText>
          ) : (
            <ul className="contact-list">
              {kontak.map((k) => (
                <li key={k.id}>
                  <a className="contact-pill" href={safeUrl(k.url)} target="_blank" rel="noreferrer noopener">
                    {k.nama_media}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer name={profil.nama_lengkap} />
    </>
  );
};

export default PublicPage;
