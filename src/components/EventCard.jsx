function EventCard({ event }) {
  return (
    <div className="event-card">
      <div className="event-card__image-wrap">
        <img src={event.image} alt={event.title} className="event-card__image" loading="lazy" />
        <div className="event-card__image-scrim" />
        <h3 className="event-card__image-title">{event.title}</h3>
      </div>
      <div className="event-card__body">
        <div className="event-card__date">
          <span className="event-card__day">{event.day}</span>
          <span className="event-card__month">{event.month}</span>
          <span className="event-card__year">{event.year}</span>
        </div>
        <div className="event-card__details">
          <p className="event-card__time">{event.time}</p>
          <p className="event-card__label">Location</p>
          <p className="event-card__location">{event.location}</p>
          <a
            className="event-card__cta"
            href={event.ctaHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {event.ctaLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
