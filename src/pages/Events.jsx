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
      <section className="events-page__section">
        <KolamPattern />
        <div className="events-page__inner">
          <h1 className="events-page__heading">Up-Coming Events</h1>
          <div className="events-page__upcoming-list">
            {UPCOMING_EVENTS.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      <SponsorshipSection />

      <section className="events-page__section">
        <KolamPattern />
        <div className="events-page__inner">
          <h2 className="events-page__heading">Past Events</h2>
          <p className="events-page__subheading">
            Here are events that have previously been held.
          </p>
          <div className="events-page__past-list">
            {PAST_EVENTS.map((event) => (
              <PastEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default Events;
