import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import EventCard from './EventCard.jsx';
import { subscribeToEvents } from '../data/eventsRepo.js';
import './HomeEventsPreview.css';

const PREVIEW_COUNT = 3;

function HomeEventsPreview() {
  const [events, setEvents] = useState([]);

  useEffect(() => subscribeToEvents(setEvents), []);

  const upcomingEvents = events
    .filter((event) => event.status === 'upcoming')
    .slice(0, PREVIEW_COUNT);

  return (
    <section className="home-events">
      <div className="home-events__inner">
        <motion.h2
          className="home-events__heading"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          Upcoming Events
        </motion.h2>

        {upcomingEvents.length > 0 ? (
          <div className="home-events__list">
            {upcomingEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        ) : (
          <p className="home-events__empty">
            No upcoming events right now — check back soon.
          </p>
        )}

        <Link to="/events" className="home-events__cta">
          See All Events
        </Link>
      </div>
    </section>
  );
}

export default HomeEventsPreview;
