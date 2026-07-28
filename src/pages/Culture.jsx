import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout.jsx';
import { CULTURE_CONTENT } from '../data/cultureContent.js';
import './Culture.css';

function Culture() {
  const [language, setLanguage] = useState('en');
  const content = CULTURE_CONTENT[language];
  const langAttr = language === 'kn' ? 'kn' : 'en';

  return (
    <Layout>
      <section className="culture-page">
        <div className="culture-page__inner">
          <div className="culture-page__toggle">
            <button
              type="button"
              className={
                language === 'en'
                  ? 'culture-page__lang culture-page__lang--active'
                  : 'culture-page__lang'
              }
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={
                language === 'kn'
                  ? 'culture-page__lang culture-page__lang--active'
                  : 'culture-page__lang'
              }
              onClick={() => setLanguage('kn')}
              lang="kn"
            >
              ಕನ್ನಡ
            </button>
          </div>

          <motion.h1
            className="culture-page__heading"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            lang={langAttr}
          >
            {content.heading}
          </motion.h1>

          {content.intro.map((paragraph, index) => (
            <motion.p
              key={index}
              className="culture-page__paragraph"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
              lang={langAttr}
            >
              {paragraph}
            </motion.p>
          ))}

          <motion.h2
            className="culture-page__pillars-heading"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            lang={langAttr}
          >
            {content.pillarsIntro}
          </motion.h2>

          <div className="culture-page__pillars">
            {content.pillars.map((pillar, index) => (
              <motion.div
                key={pillar.transliteration}
                className="culture-page__pillar-card"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
              >
                <span className="culture-page__pillar-kannada" lang="kn">
                  {pillar.kannada}
                </span>
                <h3 className="culture-page__pillar-title">{pillar.transliteration}</h3>
                <p className="culture-page__pillar-description" lang={langAttr}>
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="culture-page__paragraph culture-page__closing"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            lang={langAttr}
          >
            {content.closing}
          </motion.p>
        </div>
      </section>
    </Layout>
  );
}

export default Culture;
