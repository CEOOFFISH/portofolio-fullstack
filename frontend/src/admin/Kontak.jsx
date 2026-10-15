// frontend/src/admin/Kontak.jsx
// Panel CRUD kontak & media sosial -> endpoint /kontak
import CrudManager from '../components/CrudManager';
import { kontakApi } from '../api/backendApi';
import { safeUrl } from '../utils/format';

const fields = [
  { name: 'nama_media', label: 'Nama Media', type: 'text', required: true, maxLength: 255, placeholder: 'Contoh: GitHub, LinkedIn, Email' },
  {
    name: 'url',
    label: 'URL',
    type: 'url',
    allowMailto: true,
    required: true,
    maxLength: 255,
    placeholder: 'https://github.com/username  atau  mailto:nama@email.com',
  },
];

const columns = [
  { key: 'nama_media', label: 'Media' },
  {
    key: 'url',
    label: 'Tautan',
    render: (r) => (
      <a href={safeUrl(r.url)} target="_blank" rel="noreferrer noopener">
        {r.url}
      </a>
    ),
  },
];

const Kontak = () => (
  <CrudManager title="Kontak & Media Sosial" itemName="kontak" api={kontakApi} fields={fields} columns={columns} />
);

export default Kontak;
