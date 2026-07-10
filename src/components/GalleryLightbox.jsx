import { useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import './GalleryLightbox.css';

function GalleryLightbox({ images, index, title, onClose, onPrev, onNext }) {
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onPrev();
      if (event.key === 'ArrowRight') onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const src = images[index];
  const hasMultiple = images.length > 1;

  async function handleDownload(event) {
    event.stopPropagation();
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title || 'photo'}-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(src, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <div className="lightbox" onClick={onClose}>
      <button
        type="button"
        className="lightbox__close"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        aria-label="Close"
      >
        &times;
      </button>

      {hasMultiple && (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--prev"
          onClick={(event) => {
            event.stopPropagation();
            onPrev();
          }}
          aria-label="Previous image"
        >
          &#8249;
        </button>
      )}

      <motion.img
        key={src}
        src={src}
        alt={title}
        className="lightbox__image"
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
      />

      {hasMultiple && (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--next"
          onClick={(event) => {
            event.stopPropagation();
            onNext();
          }}
          aria-label="Next image"
        >
          &#8250;
        </button>
      )}

      <div className="lightbox__footer" onClick={(event) => event.stopPropagation()}>
        <span className="lightbox__counter">
          {index + 1} / {images.length}
        </span>
        <button type="button" className="lightbox__download" onClick={handleDownload}>
          Download
        </button>
      </div>
    </div>
  );
}

export default GalleryLightbox;
