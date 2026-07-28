import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NAV_LINKS } from '../data/navLinks.js';
import './NavBar.css';

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return undefined;
    function handleKeydown(event) {
      if (event.key === 'Escape') closeMenu();
    }
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [menuOpen]);

  return (
    <>
      <nav className="navbar">
        <div className="navbar__brand">
          <img src="/m.png" alt="Mayura Kannada Sangha logo" className="navbar__logo" />
          <span className="navbar__brand-name">Mayura Kannada Sangha</span>
        </div>
        <img
          src="/videos/Mayura Kannada Sangha.png"
          alt="Mayura Kannada Sangha"
          className="navbar__mobile-banner"
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
          <motion.span
            className="navbar__toggle-bar"
            animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 11 : 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          />
          <motion.span
            className="navbar__toggle-bar"
            animate={{ opacity: menuOpen ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="navbar__toggle-bar"
            animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -11 : 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          />
        </button>
      </nav>
      {menuOpen && (
        <>
          <motion.div
            className="navbar__mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={closeMenu}
          />
          <div className="navbar__mobile-menu">
            <motion.div
              className="navbar__mobile-layer navbar__mobile-layer--1"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            />
            <motion.div
              className="navbar__mobile-layer navbar__mobile-layer--2"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.4, 0, 0.2, 1] }}
            />
            <motion.div
              className="navbar__mobile-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <button
                type="button"
                className="navbar__mobile-close"
                aria-label="Close navigation menu"
                onClick={closeMenu}
              >
                ×
              </button>
              <ul className="navbar__mobile-links">
                {NAV_LINKS.map(({ to, label }, index) => (
                  <motion.li
                    key={to}
                    initial={{ opacity: 0, y: 40, rotate: 8 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 20,
                      delay: 0.32 + index * 0.06,
                    }}
                  >
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
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </>
      )}
    </>
  );
}

export default NavBar;
