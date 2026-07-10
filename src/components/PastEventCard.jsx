import { motion } from 'framer-motion';
import './PastEventCard.css';

function PastEventCard({ event, index = 0 }) {
  return (
    <motion.div
      className="past-event"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
    >
      <div className="past-event__image-wrap">
        <img src={event.image} alt={event.title} className="past-event__image" loading="lazy" />
        <div className="past-event__image-scrim" />
        <h3 className="past-event__image-title">{event.title}</h3>
      </div>
      <div className="past-event__body">
        <p className="past-event__label">Date</p>
        <p className="past-event__date">{event.date}</p>
        <p className="past-event__label">Location</p>
        <p className="past-event__location">{event.location}</p>
      </div>
    </motion.div>
  );
}

export default PastEventCard;
