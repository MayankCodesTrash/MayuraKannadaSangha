import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout.jsx';
import SponsorshipSection from '../components/SponsorshipSection.jsx';
import { subscribeToSponsors } from '../data/sponsorsRepo.js';
import { subscribeToSettings } from '../data/settingsRepo.js';
import './Sponsors.css';

const SLOTS = 3;
const INTERVAL_MS = 3500;

const TIERS = [
  { id: 'platinum', label: 'Platinum Sponsors' },
  { id: 'gold', label: 'Gold Sponsors' },
  { id: 'silver', label: 'Silver Sponsors' },
  { id: 'bronze', label: 'Bronze Sponsors' },
];

function SponsorTier({ tier, sponsors }) {
  const [start, setStart] = useState(0);
  const [instant, setInstant] = useState(false);
  const total = sponsors.length;
  const loops = total > SLOTS;

  const trackItems = useMemo(() => {
    if (!loops) return [...sponsors, ...Array(SLOTS - total).fill(null)];
    return [...sponsors, ...sponsors.slice(0, SLOTS)];
  }, [sponsors, total, loops]);

  useEffect(() => {
    if (!loops) return undefined;
    const timer = setInterval(() => {
      setStart((current) => current + 1);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [loops]);

  function handleAnimationComplete() {
    if (!loops) return;
    if (start >= total) {
      setInstant(true);
      setStart(0);
    } else if (instant) {
      setInstant(false);
    }
  }

  return (
    <div className={`sponsors-tiers__tier sponsors-tiers__tier--${tier.id}`}>
      <h3 className="sponsors-tiers__tier-label">{tier.label}</h3>
      <div className="sponsors-tiers__viewport">
        <motion.div
          className="sponsors-tiers__track"
          animate={{ x: `-${(start * 100) / SLOTS}%` }}
          transition={instant ? { duration: 0 } : { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          onAnimationComplete={handleAnimationComplete}
        >
          {trackItems.map((sponsor, i) => (
            <div
              key={sponsor ? `${sponsor.id}-${i}` : `placeholder-${i}`}
              className="sponsors-tiers__slot"
            >
              {sponsor ? (
                <img
                  src={sponsor.image}
                  alt={sponsor.name}
                  className="sponsors-tiers__photo"
                />
              ) : (
                <div
                  className="sponsors-tiers__placeholder"
                  aria-label={`${tier.label} placeholder`}
                />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function Sponsors() {
  const [sponsors, setSponsors] = useState([]);
  const [sponsorsSectionVisible, setSponsorsSectionVisible] = useState(true);

  useEffect(() => subscribeToSponsors(setSponsors), []);
  useEffect(
    () => subscribeToSettings((settings) => setSponsorsSectionVisible(settings.sponsorsSectionVisible)),
    []
  );

  const sortedSponsors = useMemo(() => {
    return [...sponsors].sort((a, b) => {
      const orderDiff = (a.order ?? 0) - (b.order ?? 0);
      return orderDiff !== 0 ? orderDiff : a.id.localeCompare(b.id);
    });
  }, [sponsors]);

  return (
    <Layout>
      <SponsorshipSection />
      {sponsorsSectionVisible && (
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

            {TIERS.map((tier) => {
              const tierSponsors = sortedSponsors.filter((sponsor) =>
                sponsor.tier === tier.id
              );
              return (
                <SponsorTier
                  key={tier.id}
                  tier={tier}
                  sponsors={tierSponsors}
                />
              );
            })}
          </div>
        </section>
      )}
    </Layout>
  );
}

export default Sponsors;
