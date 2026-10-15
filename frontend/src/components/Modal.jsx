// frontend/src/components/Modal.jsx
// Jendela dialog pop-up untuk formulir tambah/edit dan konfirmasi hapus.
import { useEffect } from 'react';
import Loading from './Loading';

const Modal = ({ isOpen, onClose, title, children, isLoading = false, loadingTitle = 'Memproses...' }) => {
  // Tutup dengan tombol Escape (kecuali sedang memproses)
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onMouseDown={() => !isLoading && onClose()}>
      {/* stopPropagation: klik di dalam kotak modal tidak menutup modal */}
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} disabled={isLoading} aria-label="Tutup">
          ×
        </button>
        {title && <h3 className="modal-title">{title}</h3>}
        <div className="modal-body">{children}</div>
        {isLoading && <Loading type="modal" title={loadingTitle} />}
      </div>
    </div>
  );
};

export default Modal;
