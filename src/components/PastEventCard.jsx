function PastEventCard({ event }) {
  return (
    <div className="past-event">
      <img src={event.image} alt={event.title} className="past-event__image" loading="lazy" />
      <div className="past-event__body">
        <p className="past-event__date">
          <svg
            className="past-event__icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
            <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {event.date}
        </p>
        <h3 className="past-event__title">{event.title}</h3>
        <p className="past-event__location">
          <svg
            className="past-event__icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 22s7-7.58 7-12.5A7 7 0 0 0 5 9.5C5 14.42 12 22 12 22Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          {event.location}
        </p>
      </div>
    </div>
  );
}

export default PastEventCard;
