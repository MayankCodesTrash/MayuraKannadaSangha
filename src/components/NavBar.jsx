import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { isNavSolid } from '../utils/scroll.js';
import './NavBar.css';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/culture', label: 'Our Culture and Values' },
  { to: '/team', label: 'Team' },
  { to: '/contact', label: 'Contact' },
];

function NavBar() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setSolid(isNavSolid(window.scrollY));
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className="navbar"
      animate={{
        backgroundColor: solid ? 'rgba(232, 98, 44, 1)' : 'rgba(232, 98, 44, 0)',
        boxShadow: solid ? '0 2px 12px rgba(0,0,0,0.15)' : '0 0 0 rgba(0,0,0,0)',
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <motion.img
        src="/m.png"
        alt="Mayura Kannada Sangha logo"
        className="navbar__logo"
        animate={{ height: solid ? 40 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />
      <ul className="navbar__links">
        {LINKS.map(({ to, label }) => (
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
    </motion.nav>
  );
}

export default NavBar;
