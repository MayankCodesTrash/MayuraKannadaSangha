import { Link } from 'react-router-dom';
import WaveDividerLayers from './WaveDividerLayers.jsx';
import { NAV_LINKS } from '../data/navLinks.js';
import { useAuth } from '../auth/AuthContext.jsx';
import './Footer.css';

const INSTAGRAM_URL = 'https://www.instagram.com/MayuraKannadaSangha/';

function Footer() {
  const { currentUser, logout } = useAuth();

  return (
    <footer className="footer">
      <WaveDividerLayers fill="var(--color-orange)" />
      <div className="footer__content">
        <ul className="footer__links">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <Link to={to} className="footer__link">
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <p className="footer__name">
          <span className="mks-highlight">M</span>ayura{' '}
          <span className="mks-highlight">K</span>annada{' '}
          <span className="mks-highlight">S</span>angha
        </p>
        <p className="footer__location">Central Iowa</p>
        <a className="footer__email" href="mailto:mksdsm2024@gmail.com">
          mksdsm2024@gmail.com
        </a>
        <p className="footer__nonprofit">
          A Registered, Non-Profit, Tax-Exempt 501(C)(3) Organization
        </p>

        <a
          className="footer__instagram"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            className="footer__instagram-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" />
          </svg>
          Follow us on Instagram
        </a>

        <div className="footer__admin">
          {currentUser ? (
            <>
              <Link to="/admin" className="footer__admin-link">
                Admin Dashboard
              </Link>
              <button type="button" className="footer__admin-link" onClick={logout}>
                Log Out
              </button>
            </>
          ) : (
            <Link to="/admin/login" className="footer__admin-link">
              Admin Sign In
            </Link>
          )}
        </div>

        <p className="footer__copyright">
          © {new Date().getFullYear()} Mayura Kannada Sangha, Central Iowa
        </p>
      </div>
    </footer>
  );
}

export default Footer;
