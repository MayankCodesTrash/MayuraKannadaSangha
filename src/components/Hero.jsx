import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GALLERY_IMAGES } from '../data/galleryImages.js';
import './Hero.css';

const SLIDE_COUNT = 5;
const SLIDE_INTERVAL = 6000;
const slides = GALLERY_IMAGES.slice(0, SLIDE_COUNT);

function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero">
      <AnimatePresence>
        <motion.img
          key={slides[index]}
          src={slides[index]}
          alt=""
          aria-hidden="true"
          className="hero__slide"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        />
      </AnimatePresence>
      <div className="hero__tint" />
      <div className="hero__scrim" />
      <div className="hero__text">
        <p className="hero__line hero__line--english">Welcome to</p>
        <p className="hero__line hero__line--english hero__line--title">
          <span className="mks-highlight">M</span>ayura{' '}
          <span className="mks-highlight">K</span>annada{' '}
          <span className="mks-highlight">S</span>angha
        </p>
        <p className="hero__line hero__line--english">Central Iowa</p>
        <p className="hero__line hero__line--kannada hero__line--title">ಮಯೂರ ಕನ್ನಡ ಸಂಘ</p>
        <p className="hero__line hero__line--kannada">ಸೆಂಟ್ರಲ್ ಅಯೋವಾ</p>
      </div>
      <div className="hero__scroll-cue" aria-hidden="true" />
    </section>
  );
}

export default Hero;
