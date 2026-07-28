import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GALLERY_IMAGES } from '../data/galleryImages.js';
import './HomePhotoHighlights.css';

const HIGHLIGHT_COUNT = 6;

function HomePhotoHighlights() {
  const photos = GALLERY_IMAGES.slice(0, HIGHLIGHT_COUNT);

  return (
    <section className="home-photos">
      <div className="home-photos__inner">
        <motion.h2
          className="home-photos__heading"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          Photo Highlights
        </motion.h2>

        <div className="home-photos__grid">
          {photos.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`Mayura Kannada Sangha event photo ${index + 1}`}
              className="home-photos__image"
              loading="lazy"
            />
          ))}
        </div>

        <Link to="/gallery" className="home-photos__cta">
          View Full Gallery
        </Link>
      </div>
    </section>
  );
}

export default HomePhotoHighlights;
