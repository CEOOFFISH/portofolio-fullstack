// frontend/src/admin/Pendidikan.jsx
// Panel CRUD riwayat pendidikan -> endpoint /pendidikan
import CrudManager from '../components/CrudManager';
import { pendidikanApi } from '../api/backendApi';
import { formatPeriod, validateYearRange } from '../utils/format';

const fields = [
  { name: 'nama_institusi', label: 'Nama Institusi', type: 'text', required: true, maxLength: 255, placeholder: 'Contoh: Universitas Negeri Medan' },
  { name: 'tingkat', label: 'Tingkat', type: 'text', required: true, maxLength: 255, placeholder: 'Contoh: SMA, D3, S1' },
  { name: 'jurusan', label: 'Jurusan', type: 'text', required: true, maxLength: 255, placeholder: 'Contoh: Ilmu Komputer' },
  { name: 'tahun_mulai', label: 'Tahun Mulai', type: 'number', required: true, min: 1900, max: 2100, placeholder: '2020' },
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
  { key: 'nama_institusi', label: 'Institusi' },
  { key: 'tingkat', label: 'Tingkat' },
  { key: 'jurusan', label: 'Jurusan' },
  { key: 'tahun', label: 'Tahun', render: (r) => formatPeriod(r.tahun_mulai, r.tahun_selesai) },
];

const Pendidikan = () => (
  <CrudManager
    title="Riwayat Pendidikan"
    itemName="pendidikan"
    api={pendidikanApi}
    fields={fields}
    columns={columns}
    validate={validateYearRange}
  />
);

export default Pendidikan;
