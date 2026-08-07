import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ContributionSection.css';

const ZELLE_EMAIL = 'mksdsm2024@gmail.com';

function ContributionModal({ onClose }) {
  useEffect(() => {
    function handleKeydown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [onClose]);

  return (
    <motion.div
      className="contribution-modal__overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="contribution-modal__card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="contribution-modal__close"
          aria-label="Close"
          onClick={onClose}
        >
          &times;
        </button>

        <div className="contribution-modal__logos">
          <img src="/m.png" alt="Mayura Kannada Sangha logo" className="contribution-modal__logo" />
          <img src="/Veridian.png" alt="Veridian Credit Union logo" className="contribution-modal__logo" />
        </div>

        <p className="contribution-modal__text">We bank with Veridian and accept transactions as follows</p>

        <p className="contribution-modal__thanks">
          Thank you for your submission! Your M.K.S. sponsorship renewal form has been received.
        </p>

        <p className="contribution-modal__text">
          We truly appreciate your continued support and partnership with M.K.S.
        </p>

        <p className="contribution-modal__text">
          Please send your payment via Zelle to:{' '}
          <a href={`mailto:${ZELLE_EMAIL}`} className="contribution-modal__email">
            {ZELLE_EMAIL}
          </a>
        </p>

        <p className="contribution-modal__text">
          Include your business name and sponsorship level in the payment notes/comments section.
        </p>

        <p className="contribution-modal__text">
          Thank you again for supporting M.K.S. We look forward to another amazing year together!
        </p>
      </motion.div>
    </motion.div>
  );
}

function ContributionSection() {
  const [showModal, setShowModal] = useState(false);

  return (
    <section className="contribution">
      <div className="contribution__inner">
        <p className="contribution__text">
          If you don&apos;t own a business, and would like to make a monetary contribution of your
          choice{' '}
          <button type="button" className="contribution__link" onClick={() => setShowModal(true)}>
            please click here!
          </button>
        </p>
      </div>

      <AnimatePresence>
        {showModal && <ContributionModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </section>
  );
}

export default ContributionSection;
