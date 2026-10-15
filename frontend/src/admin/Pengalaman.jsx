// frontend/src/admin/Pengalaman.jsx
// Panel CRUD pengalaman kerja / organisasi -> endpoint /pengalaman
import CrudManager from '../components/CrudManager';
import { pengalamanApi } from '../api/backendApi';
import { formatPeriod, validateYearRange } from '../utils/format';

const fields = [
  { name: 'nama_perusahaan', label: 'Perusahaan / Organisasi', type: 'text', required: true, maxLength: 255, placeholder: 'Contoh: Himpunan Mahasiswa Ilmu Komputer' },
  { name: 'jabatan', label: 'Jabatan', type: 'text', required: true, maxLength: 255, placeholder: 'Contoh: Ketua Divisi Web' },
  { name: 'tahun_mulai', label: 'Tahun Mulai', type: 'number', required: true, min: 1900, max: 2100, placeholder: '2022' },
  {
    name: 'tahun_selesai',
    label: 'Tahun Selesai',
    type: 'number',
    required: true,
    min: 0,
    max: 2100,
    placeholder: '2024',
    help: 'Isi 0 jika masih berjalan (akan tampil “Sekarang”).',
  },
];

const columns = [
  { key: 'nama_perusahaan', label: 'Perusahaan / Organisasi' },
  { key: 'jabatan', label: 'Jabatan' },
  { key: 'tahun', label: 'Tahun', render: (r) => formatPeriod(r.tahun_mulai, r.tahun_selesai) },
];

const Pengalaman = () => (
  <CrudManager
    title="Pengalaman Kerja / Organisasi"
    itemName="pengalaman"
    api={pengalamanApi}
    fields={fields}
    columns={columns}
    validate={validateYearRange}
  />
);

export default Pengalaman;
