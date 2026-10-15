// frontend/src/admin/Karya.jsx
// Panel CRUD karya terbaik / proyek -> endpoint /karya
import CrudManager from '../components/CrudManager';
import { karyaApi } from '../api/backendApi';
import { safeUrl } from '../utils/format';

const fields = [
  { name: 'nama_karya', label: 'Nama Karya', type: 'text', required: true, maxLength: 255, placeholder: 'Contoh: Aplikasi Kasir' },
  { name: 'deskripsi', label: 'Deskripsi', type: 'textarea', required: true, maxLength: 5000, placeholder: 'Jelaskan singkat tentang karya ini' },
  { name: 'url', label: 'URL / Tautan Proyek', type: 'url', required: true, maxLength: 255, placeholder: 'https://github.com/username/proyek' },
];

const columns = [
  { key: 'nama_karya', label: 'Nama Karya' },
  {
    key: 'deskripsi',
    label: 'Deskripsi',
    render: (r) => (r.deskripsi.length > 90 ? `${r.deskripsi.slice(0, 90)}…` : r.deskripsi),
  },
  {
    key: 'url',
    label: 'Tautan',
    render: (r) => (
      <a href={safeUrl(r.url)} target="_blank" rel="noreferrer noopener">
        Kunjungi
      </a>
    ),
  },
];

const Karya = () => (
  <CrudManager title="Karya Terbaik" itemName="karya" api={karyaApi} fields={fields} columns={columns} />
);

export default Karya;
