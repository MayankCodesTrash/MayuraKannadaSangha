import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout.jsx';
import { subscribeToTeam } from '../data/teamRepo.js';
import { DEFAULT_OFFICE_BEARERS } from '../data/officeBearers.js';
import './Team.css';

function Team() {
  const [members, setMembers] = useState([]);

  useEffect(() => subscribeToTeam(setMembers), []);

  const officeBearers = useMemo(() => {
    if (members.length === 0) return DEFAULT_OFFICE_BEARERS;
    return [...members].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [members]);

  return (
    <Layout>
      <section className="team-page">
        <div className="team-page__inner">
          <motion.h1
            className="team-page__heading"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            2026 Office Bearers
          </motion.h1>
          <p className="team-page__contact">
            Contact us at <a href="mailto:mksdsm2024@gmail.com">mksdsm2024@gmail.com</a>
          </p>

          <div className="team-page__grid">
            {officeBearers.map(({ name, role, image }, index) => (
              <motion.div
                key={name}
                className="team-page__card"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
              >
                <div className="team-page__photo">
                  {image ? (
                    <img src={image} alt={name} className="team-page__photo-img" />
                  ) : (
                    <div
                      className="team-page__photo-placeholder"
                      aria-label={`${name} photo placeholder`}
                    />
                  )}
                </div>
                <h2 className="team-page__name">{name}</h2>
                <p className="team-page__role">{role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default Team;
