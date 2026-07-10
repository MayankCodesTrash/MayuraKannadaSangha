import { motion } from 'framer-motion';
import Layout from '../components/Layout.jsx';
import KolamPattern from '../components/KolamPattern.jsx';
import EventCard from '../components/EventCard.jsx';
import SponsorshipSection from '../components/SponsorshipSection.jsx';
import PastEventCard from '../components/PastEventCard.jsx';
import { UPCOMING_EVENTS } from '../data/upcomingEvents.js';
import { PAST_EVENTS } from '../data/pastEvents.js';
import './Events.css';

function Events() {
  return (
    <Layout>
      <section className="events-page__section events-page__section--upcoming">
        <KolamPattern />
        <div className="events-page__inner">
          <motion.h1
            className="events-page__heading"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            Up-Coming Events
          </motion.h1>
          <div className="events-page__upcoming-list">
            {UPCOMING_EVENTS.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        </div>
      </section>

      <SponsorshipSection />

      <section className="events-page__section">
        <KolamPattern />
        <div className="events-page__inner">
          <motion.h2
            className="events-page__heading"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            Past Events
          </motion.h2>
          <p className="events-page__subheading">
            Here are events that have previously been held.
          </p>
          <div className="events-page__past-list">
            {PAST_EVENTS.map((event, index) => (
              <PastEventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default Events;
