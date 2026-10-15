// frontend/src/components/Footer.jsx
const Footer = ({ name }) => (
  <footer className="footer">
    <p>
      © {new Date().getFullYear()} {name || 'Portofolio Pribadi'}. Dibuat dengan React, PHP, dan MySQL.
    </p>
  </footer>
);

export default Footer;
