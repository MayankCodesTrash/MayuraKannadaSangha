import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout.jsx';
import KolamPattern from '../components/KolamPattern.jsx';
import GalleryLightbox from '../components/GalleryLightbox.jsx';
import { subscribeToCategories } from '../data/galleryRepo.js';
import './Gallery.css';

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
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => subscribeToCategories(setCategories), []);

  const category = categories.find((entry) => entry.id === categoryId) ?? null;

  function openCategory(id) {
    setCategoryId(id);
    setLightboxIndex(null);
  }

  function closeCategory() {
    setCategoryId(null);
    setLightboxIndex(null);
  }

  function showPrev() {
    setLightboxIndex((current) => (current - 1 + category.images.length) % category.images.length);
  }

  function showNext() {
    setLightboxIndex((current) => (current + 1) % category.images.length);
  }

  return (
    <Layout>
      <section className="gallery-page">
        <KolamPattern />
        <div className="gallery-page__inner">
          {!category ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <h1 className="gallery-page__heading">Gallery</h1>
              <div className="gallery-bento">
                {categories.map((entry, index) => (
                  <button
                    type="button"
                    key={entry.id}
                    className={bentoClass(bentoSize(index))}
                    onClick={() => openCategory(entry.id)}
                    aria-label={entry.title}
                  >
                    <img src={entry.images[0]?.url} alt={entry.title} loading="lazy" />
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
              key={category.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <button type="button" className="gallery-page__back" onClick={closeCategory}>
                &#8592; Back to Gallery
              </button>
              <h1 className="gallery-page__heading">{category.title}</h1>
              <div className="gallery-bento">
                {category.images.map((image, index) => (
                  <button
                    type="button"
                    key={image.url}
                    className={bentoClass(bentoSize(index))}
                    onClick={() => setLightboxIndex(index)}
                  >
                    <img src={image.url} alt={`${category.title} photo ${index + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {category && lightboxIndex !== null && (
        <GalleryLightbox
          images={category.images.map((image) => image.url)}
          index={lightboxIndex}
          title={category.title}
          onClose={() => setLightboxIndex(null)}
          onPrev={showPrev}
          onNext={showNext}
        />
      )}
    </Layout>
  );
}

export default Gallery;
