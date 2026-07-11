import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { isNavSolid } from '../utils/scroll.js';
import { NAV_LINKS } from '../data/navLinks.js';
import './NavBar.css';

const MOBILE_BREAKPOINT = 640;
const NAV_HEIGHT = { desktop: 256, mobile: 96 };
const NAV_HEIGHT_SCROLLED = { desktop: 120, mobile: 64 };
const LOGO_HEIGHT = { desktop: 240, mobile: 64 };
const LOGO_HEIGHT_SCROLLED = { desktop: 96, mobile: 44 };

function NavBar() {
  const [solid, setSolid] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setSolid(isNavSolid(window.scrollY));
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  const size = isMobile ? 'mobile' : 'desktop';
  const navHeight = solid ? NAV_HEIGHT_SCROLLED[size] : NAV_HEIGHT[size];
  const logoHeight = solid ? LOGO_HEIGHT_SCROLLED[size] : LOGO_HEIGHT[size];

  return (
    <>
      <motion.nav
        className="navbar"
        animate={{ height: navHeight }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="navbar__scrim" />
        <motion.div
          className="navbar__solid"
          animate={{
            opacity: solid ? 1 : 0,
            boxShadow: solid ? '0 2px 12px rgba(0,0,0,0.15)' : '0 0 0 rgba(0,0,0,0)',
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
        <motion.img
          src="/m.png"
          alt="Mayura Kannada Sangha logo"
          className="navbar__logo"
          animate={{ height: logoHeight }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
        <ul className="navbar__links">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  'navbar__link' + (isActive ? ' navbar__link--active' : '')
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="navbar__toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
        </button>
      </motion.nav>
      {menuOpen && (
        <div className="navbar__mobile-menu">
          <button
            type="button"
            className="navbar__mobile-close"
            aria-label="Close navigation menu"
            onClick={closeMenu}
          >
            ×
          </button>
          <ul className="navbar__mobile-links">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    'navbar__mobile-link' + (isActive ? ' navbar__mobile-link--active' : '')
                  }
                  onClick={closeMenu}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default NavBar;
