import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './ImageCarousel.css';

function ImageCarousel({ images, interval = 2500 }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || images.length <= 1) return undefined;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [paused, images, interval]);

  return (
    <div
      className="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.img
        key={images[index]}
        src={images[index]}
        alt="Mayura Kannada Sangha gallery photo"
        className="carousel__image"
        loading="lazy"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
      <div className="carousel__dots">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            className={`carousel__dot${i === index ? ' carousel__dot--active' : ''}`}
            aria-label={`Show gallery image ${i + 1}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}

export default ImageCarousel;
