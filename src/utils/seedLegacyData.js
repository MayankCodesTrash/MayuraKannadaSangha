import { UPCOMING_EVENTS } from '../data/upcomingEvents.js';
import { PAST_EVENTS } from '../data/pastEvents.js';
import { GALLERY_SECTIONS } from '../data/gallerySections.js';
import { createEvent } from '../data/eventsRepo.js';
import { createCategoryFromUrls } from '../data/galleryRepo.js';

function toButtons(event) {
  return event.ctaLabel && event.ctaHref ? [{ label: event.ctaLabel, url: event.ctaHref }] : [];
}

function parsePastEventDate(dateString) {
  const [month, dayWithComma, year] = dateString.split(' ');
  return { month, day: dayWithComma.replace(',', ''), year };
}

export async function seedLegacyData() {
  for (const event of UPCOMING_EVENTS) {
    await createEvent({
      title: event.title,
      day: event.day,
      month: event.month,
      year: event.year,
      time: event.time,
      location: event.location,
      image: event.image,
      storagePath: null,
      status: 'upcoming',
      buttons: toButtons(event),
    });
  }

  for (const event of PAST_EVENTS) {
    const { month, day, year } = parsePastEventDate(event.date);
    await createEvent({
      title: event.title,
      day,
      month,
      year,
      time: '',
      location: event.location,
      image: event.image,
      storagePath: null,
      status: 'past',
      buttons: [],
    });
  }

  for (const section of GALLERY_SECTIONS) {
    await createCategoryFromUrls(section.title, section.images);
  }
}
