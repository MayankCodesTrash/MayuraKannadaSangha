import { motion } from 'framer-motion';
import Layout from '../components/Layout.jsx';
import { GavelIcon, QuillIcon, CoinIcon, ChairIcon } from '../components/icons/RoleIcons.jsx';
import './Team.css';

const OFFICE_BEARERS = [
  { name: 'Arun Kumar', role: 'President', Icon: GavelIcon },
  { name: 'Chandra Shekar', role: 'Secretary', Icon: QuillIcon },
  { name: 'Yogeshwara Gonchigar', role: 'Treasurer', Icon: CoinIcon },
  { name: 'Naveen Setty', role: 'Chairperson', Icon: ChairIcon },
  { name: 'Raghunath Shammanna', role: 'Chairperson', Icon: ChairIcon },
];

function Team() {
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
            {OFFICE_BEARERS.map(({ name, role, Icon }, index) => (
              <motion.div
                key={name}
                className="team-page__card"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
              >
                <div className="team-page__icon">
                  <Icon />
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
