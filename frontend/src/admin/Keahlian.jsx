// frontend/src/admin/Keahlian.jsx
// Panel CRUD keahlian (skills) -> endpoint /keahlian
import CrudManager from '../components/CrudManager';
import { keahlianApi } from '../api/backendApi';

const fields = [
  { name: 'nama_keahlian', label: 'Nama Keahlian', type: 'text', required: true, maxLength: 255, placeholder: 'Contoh: React.js' },
  {
    name: 'level',
    label: 'Level',
    type: 'select',
    required: true,
    options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    defaultValue: 'Beginner',
  },
];

const columns = [
  { key: 'nama_keahlian', label: 'Keahlian' },
  { key: 'level', label: 'Level' },
];

const Keahlian = () => (
  <CrudManager title="Keahlian" itemName="keahlian" api={keahlianApi} fields={fields} columns={columns} />
);

export default Keahlian;
