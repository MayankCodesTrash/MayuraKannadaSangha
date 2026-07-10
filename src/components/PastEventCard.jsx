function PastEventCard({ event }) {
  return (
    <div className="past-event">
      <img src={event.image} alt={event.title} className="past-event__image" loading="lazy" />
      <div className="past-event__body">
        <p className="past-event__date">{event.date}</p>
        <h3 className="past-event__title">{event.title}</h3>
        <p className="past-event__location">{event.location}</p>
      </div>
    </div>
  );
}

export default PastEventCard;
