// frontend/src/components/Alert.jsx
// Notifikasi (toast) sukses / gagal. Hilang otomatis setelah beberapa detik.
// Pemakaian: const [alert, setAlert] = useState({ show: false, type: '', message: '' });
//            <Alert alert={alert} setAlert={setAlert} />
import { useEffect } from 'react';

export const closedAlert = { show: false, type: '', message: '' };

const Alert = ({ alert, setAlert }) => {
  useEffect(() => {
    if (!alert.show) return undefined;
    const timer = setTimeout(() => setAlert(closedAlert), 3500);
    return () => clearTimeout(timer);
  }, [alert, setAlert]);

  if (!alert.show) return null;

  return (
    <div className={`alert ${alert.type}`} role="alert">
      <div className="alert-content">
        <strong className="alert-title">{alert.type === 'success' ? 'Berhasil' : 'Gagal'}</strong>
        <span className="alert-message">{alert.message}</span>
      </div>
      <button type="button" className="alert-close" aria-label="Tutup notifikasi" onClick={() => setAlert(closedAlert)}>
        ×
      </button>
    </div>
  );
};

export default Alert;
