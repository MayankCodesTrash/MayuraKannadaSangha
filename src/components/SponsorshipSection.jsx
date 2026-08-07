import { motion } from 'framer-motion';
import WaveDividerLayers from './WaveDividerLayers.jsx';
import './SponsorshipSection.css';

const SPONSORSHIP_PDF_URL = '/MKS%20Dasara%202026%20Sponsorship_0727_v1.0.pdf';

function SponsorshipSection() {
  return (
    <section className="sponsorship">
      <WaveDividerLayers fill="var(--color-orange)" />
      <div className="sponsorship__content">
        <motion.div
          className="sponsorship__inner"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="sponsorship__title">Sponsorship Opportunities</h2>
          <p className="sponsorship__text">
            Click the &quot;More Info&quot; button to learn more about the 2026 Dasara
            sponsorship opportunities.
          </p>
          <a
            className="sponsorship__cta"
            href={SPONSORSHIP_PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            More Info
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default SponsorshipSection;
