import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebase.js';
import { UPCOMING_EVENTS } from '../data/upcomingEvents.js';
import { PAST_EVENTS } from '../data/pastEvents.js';
import { GALLERY_SECTIONS } from '../data/gallerySections.js';
import { DEFAULT_OFFICE_BEARERS } from '../data/officeBearers.js';
import { createEvent } from '../data/eventsRepo.js';
import { createCategoryFromUrls } from '../data/galleryRepo.js';
import { createTeamMember } from '../data/teamRepo.js';

function toButtons(event) {
  return event.ctaLabel && event.ctaHref ? [{ label: event.ctaLabel, url: event.ctaHref }] : [];
}

function parsePastEventDate(dateString) {
  const [month, dayWithComma, year] = dateString.split(' ');
  return { month, day: dayWithComma.replace(',', ''), year };
}

async function isCollectionEmpty(collectionName) {
  const snapshot = await getDocs(query(collection(db, collectionName), limit(1)));
  return snapshot.empty;
}

export async function seedLegacyData() {
  const skipped = [];

  if (await isCollectionEmpty('events')) {
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
  } else {
    skipped.push('events (already has data)');
  }

  if (await isCollectionEmpty('galleryCategories')) {
    for (const section of GALLERY_SECTIONS) {
      await createCategoryFromUrls(section.title, section.images);
    }
  } else {
    skipped.push('gallery (already has data)');
  }

  if (await isCollectionEmpty('team')) {
    for (const member of DEFAULT_OFFICE_BEARERS) {
      await createTeamMember({
        name: member.name,
        role: member.role,
        order: member.order,
        image: '',
        storagePath: null,
      });
    }
  } else {
    skipped.push('team (already has data)');
  }

  return { skipped };
}
