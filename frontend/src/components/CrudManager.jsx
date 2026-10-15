// frontend/src/components/CrudManager.jsx
// Komponen CRUD generik: tabel data + modal tambah/edit + konfirmasi hapus + notifikasi.
// Dipakai oleh Pendidikan, Pengalaman, Keahlian, Kontak, dan Karya (tinggal beda konfigurasi).
//
// Props:
//   title      : judul panel, mis. "Riwayat Pendidikan"
//   itemName   : nama satu data untuk pesan, mis. "pendidikan"
//   api        : { list(), add(data), update(data), remove(id) } dari backendApi.js
//   fields     : daftar isian formulir (lihat contoh di admin/*.jsx)
//   columns    : kolom tabel [{ key, label, render?(row) }]
//   validate   : (opsional) fungsi (form) => objek error tambahan
import { useCallback, useEffect, useMemo, useState } from 'react';
import { delay, getErrorMessage } from '../api/backendApi';
import { isValidUrl } from '../utils/format';
import Alert, { closedAlert } from './Alert';
import Loading from './Loading';
import Modal from './Modal';

const CrudManager = ({ title, itemName, api, fields, columns, validate }) => {
  const emptyForm = useMemo(
    () => Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? ''])),
    [fields]
  );

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [alert, setAlert] = useState(closedAlert);

  // ---------- Ambil data dari backend ----------
  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [rows] = await Promise.all([api.list(), delay(150)]);
      setList(rows);
    } catch (err) {
      setLoadError(getErrorMessage(err, `Gagal mengambil data ${itemName}.`));
    } finally {
      setLoading(false);
    }
  }, [api, itemName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------- Buka / tutup formulir ----------
  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm(Object.fromEntries(fields.map((f) => [f.name, row[f.name] ?? ''])));
    setErrors({});
    setFormOpen(true);
  };

  const closeForm = useCallback(() => setFormOpen(false), []);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  // ---------- Validasi formulir (backend tetap memvalidasi ulang) ----------
  const runValidation = () => {
    const found = {};
    fields.forEach((f) => {
      const raw = form[f.name];
      const value = typeof raw === 'string' ? raw.trim() : raw;

      if (f.required && (value === '' || value === null || value === undefined)) {
        found[f.name] = `${f.label} wajib diisi`;
        return;
      }
      if (value === '') return;

      if (f.type === 'number') {
        const n = Number(value);
        if (!Number.isInteger(n)) found[f.name] = `${f.label} harus berupa angka bulat`;
        else if (f.min !== undefined && n < f.min) found[f.name] = `${f.label} minimal ${f.min}`;
        else if (f.max !== undefined && n > f.max) found[f.name] = `${f.label} maksimal ${f.max}`;
      } else if (f.type === 'url') {
        if (!isValidUrl(value, f.allowMailto)) {
          found[f.name] = f.allowMailto
            ? 'URL harus diawali http://, https://, atau mailto:'
            : 'URL harus diawali http:// atau https://';
        }
      } else if (f.maxLength && String(value).length > f.maxLength) {
        found[f.name] = `${f.label} maksimal ${f.maxLength} karakter`;
      }
    });

    // Aturan tambahan khusus modul (mis. tahun selesai >= tahun mulai)
    if (validate) Object.assign(found, validate(form));
    Object.keys(found).forEach((k) => found[k] === undefined && delete found[k]);
    return found;
  };

  // ---------- Simpan (POST / PUT) ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = runValidation();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const payload = {};
    fields.forEach((f) => {
      const raw = form[f.name];
      payload[f.name] = f.type === 'number' ? Number(raw) : String(raw).trim();
    });

    setSaving(true);
    try {
      if (editingId !== null) {
        await api.update({ ...payload, id: editingId });
        setAlert({ show: true, type: 'success', message: `Data ${itemName} berhasil diperbarui.` });
      } else {
        await api.add(payload);
        setAlert({ show: true, type: 'success', message: `Data ${itemName} berhasil ditambahkan.` });
      }
      setFormOpen(false);
      await fetchData();
    } catch (err) {
      setAlert({ show: true, type: 'error', message: getErrorMessage(err, `Gagal menyimpan data ${itemName}.`) });
    } finally {
      setSaving(false);
    }
  };

  // ---------- Hapus (DELETE) setelah konfirmasi ----------
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.remove(deleteTarget.id);
      setAlert({ show: true, type: 'success', message: `Data ${itemName} berhasil dihapus.` });
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      setAlert({ show: true, type: 'error', message: getErrorMessage(err, `Gagal menghapus data ${itemName}.`) });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // ---------- Tampilan ----------
  const renderField = (f) => {
    const id = `field-${f.name}`;
    const common = {
      id,
      name: f.name,
      value: form[f.name],
      onChange: (e) => handleChange(f.name, e.target.value),
      'aria-invalid': errors[f.name] ? 'true' : 'false',
    };

    let input;
    if (f.type === 'textarea') {
      input = <textarea rows={4} placeholder={f.placeholder} {...common} />;
    } else if (f.type === 'select') {
      input = (
        <select {...common}>
          {f.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    } else {
      input = (
        <input
          type={f.type === 'number' ? 'number' : 'text'}
          placeholder={f.placeholder}
          inputMode={f.type === 'number' ? 'numeric' : undefined}
          min={f.min}
          max={f.max}
          {...common}
        />
      );
    }

    return (
      <div className="form-group" key={f.name}>
        <label htmlFor={id}>
          {f.label}
          {f.required && <span className="required"> *</span>}
        </label>
        {input}
        {f.help && !errors[f.name] && <small className="help">{f.help}</small>}
        {errors[f.name] && <small className="field-error">{errors[f.name]}</small>}
      </div>
    );
  };

  return (
    <div>
      <div className="panel-header">
        <h3>{title}</h3>
        <button type="button" className="button primary" onClick={openAdd}>
          + Tambah Data
        </button>
      </div>

      {loading ? (
        <Loading type="inline" title={`Memuat data ${itemName}...`} />
      ) : loadError ? (
        <div className="state-box error">
          <p>{loadError}</p>
          <button type="button" className="button" onClick={fetchData}>
            Coba Lagi
          </button>
        </div>
      ) : list.length === 0 ? (
        <div className="state-box">
          <p>Belum ada data {itemName}. Klik “+ Tambah Data” untuk menambahkan.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>No</th>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  {columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
                  ))}
                  <td className="actions">
                    <button type="button" className="button small" onClick={() => openEdit(row)}>
                      Edit
                    </button>
                    <button type="button" className="button small danger-outline" onClick={() => setDeleteTarget(row)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal formulir tambah / edit */}
      <Modal
        isOpen={formOpen}
        onClose={closeForm}
        title={editingId !== null ? `Edit ${title}` : `Tambah ${title}`}
        isLoading={saving}
        loadingTitle="Menyimpan..."
      >
        <form onSubmit={handleSubmit} noValidate>
          {fields.map(renderField)}
          <div className="form-actions">
            <button type="button" className="button" onClick={closeForm} disabled={saving}>
              Batal
            </button>
            <button type="submit" className="button primary" disabled={saving}>
              {editingId !== null ? 'Simpan Perubahan' : 'Tambah Sekarang'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal konfirmasi hapus */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Konfirmasi Hapus"
        isLoading={deleting}
        loadingTitle="Menghapus..."
      >
        <p>Yakin ingin menghapus data {itemName} ini? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="form-actions">
          <button type="button" className="button" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Batal
          </button>
          <button type="button" className="button danger" onClick={confirmDelete} disabled={deleting}>
            Ya, Hapus
          </button>
        </div>
      </Modal>

      <Alert alert={alert} setAlert={setAlert} />
    </div>
  );
};

export default CrudManager;
