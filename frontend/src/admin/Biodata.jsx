// frontend/src/admin/Biodata.jsx
// Menampilkan biodata admin, mengubah data, mengganti foto profil, dan mengganti password.
// Endpoint: GET /users (baca) dan POST /users (simpan, berupa FormData karena ada file foto).
import { useCallback, useEffect, useState } from 'react';
import { GetUser, UpdateUser, delay, getErrorMessage } from '../api/backendApi';
import { useAuth } from '../context/AuthContext';
import { fotoUrl, handleImageError } from '../utils/format';
import Alert, { closedAlert } from '../components/Alert';
import Loading from '../components/Loading';
import Modal from '../components/Modal';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const Biodata = () => {
  const { updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ username: '', nama_lengkap: '', email: '', nomor_hp: '', password: '', konfirmasi: '' });
  const [fotoFile, setFotoFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(closedAlert);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [res] = await Promise.all([GetUser(), delay(150)]);
      setProfile(res.data.user);
    } catch (err) {
      setLoadError(getErrorMessage(err, 'Gagal mengambil data biodata.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Buat & bersihkan URL pratinjau foto yang dipilih
  useEffect(() => {
    if (!fotoFile) {
      setPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(fotoFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [fotoFile]);

  const openEdit = () => {
    setForm({
      username: profile.username,
      nama_lengkap: profile.nama_lengkap,
      email: profile.email,
      nomor_hp: profile.nomor_hp,
      password: '',
      konfirmasi: '',
    });
    setFotoFile(null);
    setErrors({});
    setOpen(true);
  };

  const closeEdit = useCallback(() => setOpen(false), []);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFotoFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, foto: 'Format foto harus JPG, PNG, atau WEBP' }));
      e.target.value = '';
      setFotoFile(null);
      return;
    }
    if (file.size > MAX_SIZE) {
      setErrors((prev) => ({ ...prev, foto: 'Ukuran foto maksimal 5 MB' }));
      e.target.value = '';
      setFotoFile(null);
      return;
    }
    setErrors((prev) => ({ ...prev, foto: undefined }));
    setFotoFile(file);
  };

  const validate = () => {
    const found = {};
    const v = (k) => String(form[k] ?? '').trim();
    if (!v('nama_lengkap')) found.nama_lengkap = 'Nama lengkap wajib diisi';
    if (!/^[A-Za-z0-9_.-]{3,50}$/.test(v('username'))) found.username = 'Username 3-50 karakter (huruf, angka, titik, _ atau -)';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) found.email = 'Format email tidak valid';
    if (!/^[0-9+\-\s()]{6,20}$/.test(v('nomor_hp'))) found.nomor_hp = 'Nomor HP 6-20 karakter (angka, +, -, spasi, tanda kurung)';
    if (form.password) {
      if (form.password.length < 6) found.password = 'Password baru minimal 6 karakter';
      else if (form.password !== form.konfirmasi) found.konfirmasi = 'Konfirmasi password tidak sama';
    }
    return found;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const data = new FormData();
    data.append('username', form.username.trim());
    data.append('nama_lengkap', form.nama_lengkap.trim());
    data.append('email', form.email.trim());
    data.append('nomor_hp', form.nomor_hp.trim());
    if (form.password) data.append('password', form.password);
    if (fotoFile) data.append('foto', fotoFile);

    setSaving(true);
    try {
      const res = await UpdateUser(data);
      setAlert({ show: true, type: 'success', message: res.data?.message || 'Biodata berhasil diperbarui.' });
      updateUser({ username: form.username.trim(), nama_lengkap: form.nama_lengkap.trim() });
      setOpen(false);
      await fetchProfile();
    } catch (err) {
      setAlert({ show: true, type: 'error', message: getErrorMessage(err, 'Gagal memperbarui biodata.') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading type="inline" title="Memuat biodata..." />;

  if (loadError) {
    return (
      <div className="state-box error">
        <p>{loadError}</p>
        <button type="button" className="button" onClick={fetchProfile}>
          Coba Lagi
        </button>
      </div>
    );
  }

  const field = (name, label, type = 'text', extra = {}) => (
    <div className="form-group">
      <label htmlFor={`bio-${name}`}>{label}</label>
      <input
        id={`bio-${name}`}
        type={type}
        value={form[name]}
        onChange={(e) => handleChange(name, e.target.value)}
        aria-invalid={errors[name] ? 'true' : 'false'}
        {...extra}
      />
      {errors[name] && <small className="field-error">{errors[name]}</small>}
    </div>
  );

  return (
    <div className="biodata">
      <h3 className="center">Biodata Profil</h3>
      <img className="avatar avatar-md" src={fotoUrl(profile.foto)} alt="Foto profil" onError={handleImageError} />

      <dl className="detail-list">
        <dt>Username :</dt>
        <dd>{profile.username}</dd>
        <dt>Nama Lengkap :</dt>
        <dd>{profile.nama_lengkap}</dd>
        <dt>Email :</dt>
        <dd>{profile.email}</dd>
        <dt>Nomor HP :</dt>
        <dd>{profile.nomor_hp}</dd>
      </dl>

      <button type="button" className="button accent" onClick={openEdit}>
        Edit Biodata
      </button>

      <Modal isOpen={open} onClose={closeEdit} title="Edit Biodata" isLoading={saving} loadingTitle="Menyimpan...">
        <form onSubmit={handleSubmit} noValidate>
          <div className="photo-edit">
            <img
              className="avatar avatar-sm"
              src={preview || fotoUrl(profile.foto)}
              alt="Pratinjau foto"
              onError={handleImageError}
            />
            <div className="form-group grow">
              <label htmlFor="bio-foto">Foto Profil (JPG, PNG, WEBP — maks. 5 MB)</label>
              <input id="bio-foto" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} />
              {errors.foto && <small className="field-error">{errors.foto}</small>}
            </div>
          </div>

          {field('nama_lengkap', 'Nama Lengkap')}
          {field('username', 'Username')}
          {field('email', 'Email', 'email')}
          {field('nomor_hp', 'Nomor HP', 'text', { inputMode: 'tel' })}
          {field('password', 'Password Baru (kosongkan jika tidak diganti)', 'password', { autoComplete: 'new-password' })}
          {form.password &&
            field('konfirmasi', 'Konfirmasi Password Baru', 'password', { autoComplete: 'new-password' })}

          <div className="form-actions">
            <button type="button" className="button" onClick={closeEdit} disabled={saving}>
              Batal
            </button>
            <button type="submit" className="button primary" disabled={saving}>
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>

      <Alert alert={alert} setAlert={setAlert} />
    </div>
  );
};

export default Biodata;
