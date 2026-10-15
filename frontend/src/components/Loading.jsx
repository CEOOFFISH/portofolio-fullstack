// frontend/src/components/Loading.jsx
// type: "fixed" (satu halaman penuh), "inline" (di dalam kartu), "modal" (menutupi isi modal)
const Loading = ({ type = 'inline', title = 'Memuat...' }) => (
  <div className={`loading-wrap loading-${type}`} role="status" aria-live="polite">
    <div className="loading" />
    {title && <p className="loading-title">{title}</p>}
  </div>
);

export default Loading;
