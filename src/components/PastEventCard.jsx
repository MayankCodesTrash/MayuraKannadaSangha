import './PastEventCard.css';

function PastEventCard({ event }) {
  return (
    <div className="past-event">
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
    </div>
  );
}

export default PastEventCard;
