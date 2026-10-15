// frontend/src/main.jsx
// Titik masuk aplikasi: memasang React ke <div id="root"> di index.html
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './App.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
