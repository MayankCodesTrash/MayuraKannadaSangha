import { motion } from 'framer-motion';
import Layout from '../components/Layout.jsx';
import SponsorshipSection from '../components/SponsorshipSection.jsx';
import './Sponsors.css';

const TIERS = [
  { id: 'gold', label: 'Gold Sponsors', placeholders: 3 },
  { id: 'silver', label: 'Silver Sponsors', placeholders: 3 },
  { id: 'bronze', label: 'Bronze Sponsors', placeholders: 3 },
];

function Sponsors() {
  return (
    <Layout>
      <SponsorshipSection />
      <section className="sponsors-tiers">
        <div className="sponsors-tiers__inner">
          <motion.h2
            className="sponsors-tiers__heading"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            Our Sponsors
          </motion.h2>

          {TIERS.map((tier) => (
            <div key={tier.id} className={`sponsors-tiers__tier sponsors-tiers__tier--${tier.id}`}>
              <h3 className="sponsors-tiers__tier-label">{tier.label}</h3>
              <div className="sponsors-tiers__placeholder-grid">
                {Array.from({ length: tier.placeholders }).map((_, index) => (
                  <div
                    key={index}
                    className="sponsors-tiers__placeholder"
                    aria-label={`${tier.label} placeholder`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

export default Sponsors;
