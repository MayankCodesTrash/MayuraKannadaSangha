import { motion } from 'framer-motion';
import WaveDivider from './WaveDivider.jsx';
import WaveDividerLayers from './WaveDividerLayers.jsx';
import './SponsorshipSection.css';

const SPONSORSHIP_PDF_URL =
  'https://storage.googleapis.com/production-websitebuilder-v1-0-7/287/1991287/3q88gokE/b749f84296c4495688265864b222c5dc?fileName=043D207E-9024-4FE5-941E-36BE22A10E8C.pdf';

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
            Click the &quot;More Info&quot; button to learn more about the 2025 Dasara
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
        <div className="sponsorship__wave-out">
          <WaveDivider fill="var(--color-bg)" />
        </div>
      </div>
    </section>
  );
}

export default SponsorshipSection;
