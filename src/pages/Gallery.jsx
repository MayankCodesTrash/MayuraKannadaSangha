import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout.jsx';
import KolamPattern from '../components/KolamPattern.jsx';
import GalleryLightbox from '../components/GalleryLightbox.jsx';
import { GALLERY_SECTIONS } from '../data/gallerySections.js';
import './Gallery.css';

const OVERVIEW_SIZES = ['large', null, null, 'wide', null];

function bentoSize(index) {
  const spot = index % 7;
  if (spot === 0) return 'large';
  if (spot === 3) return 'wide';
  return null;
}

function bentoClass(size) {
  return `gallery-bento__item${size ? ` gallery-bento__item--${size}` : ''}`;
}

function Gallery() {
  const [sectionId, setSectionId] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const section = GALLERY_SECTIONS.find((entry) => entry.id === sectionId) ?? null;

  function openSection(id) {
    setSectionId(id);
    setLightboxIndex(null);
  }

  function closeSection() {
    setSectionId(null);
    setLightboxIndex(null);
  }

  function showPrev() {
    setLightboxIndex((current) => (current - 1 + section.images.length) % section.images.length);
  }

  function showNext() {
    setLightboxIndex((current) => (current + 1) % section.images.length);
  }

  return (
    <Layout>
      <section className="gallery-page">
        <KolamPattern />
        <div className="gallery-page__inner">
          {!section ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <h1 className="gallery-page__heading">Gallery</h1>
              <div className="gallery-bento">
                {GALLERY_SECTIONS.map((entry, index) => (
                  <button
                    type="button"
                    key={entry.id}
                    className={bentoClass(OVERVIEW_SIZES[index])}
                    onClick={() => openSection(entry.id)}
                    aria-label={entry.title}
                  >
                    <img src={entry.images[0]} alt={entry.title} loading="lazy" />
                    <div className="gallery-bento__scrim" />
                    <h2 className="gallery-bento__title" aria-hidden="true">
                      {entry.title}
                    </h2>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <button type="button" className="gallery-page__back" onClick={closeSection}>
                &#8592; Back to Gallery
              </button>
              <h1 className="gallery-page__heading">{section.title}</h1>
              <div className="gallery-bento">
                {section.images.map((src, index) => (
                  <button
                    type="button"
                    key={src}
                    className={bentoClass(bentoSize(index))}
                    onClick={() => setLightboxIndex(index)}
                  >
                    <img src={src} alt={`${section.title} photo ${index + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {section && lightboxIndex !== null && (
        <GalleryLightbox
          images={section.images}
          index={lightboxIndex}
          title={section.title}
          onClose={() => setLightboxIndex(null)}
          onPrev={showPrev}
          onNext={showNext}
        />
      )}
    </Layout>
  );
}

export default Gallery;
