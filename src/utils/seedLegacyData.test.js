import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEvent } from '../data/eventsRepo.js';
import { createCategoryFromUrls } from '../data/galleryRepo.js';
import { UPCOMING_EVENTS } from '../data/upcomingEvents.js';
import { PAST_EVENTS } from '../data/pastEvents.js';
import { GALLERY_SECTIONS } from '../data/gallerySections.js';
import { seedLegacyData } from './seedLegacyData.js';

vi.mock('../data/eventsRepo.js', () => ({ createEvent: vi.fn(() => Promise.resolve('evt-id')) }));
vi.mock('../data/galleryRepo.js', () => ({
  createCategoryFromUrls: vi.fn(() => Promise.resolve('cat-id')),
}));

beforeEach(() => {
  vi.mocked(createEvent).mockClear();
  vi.mocked(createCategoryFromUrls).mockClear();
});

describe('seedLegacyData', () => {
  it('creates one event per upcoming and past legacy event', async () => {
    await seedLegacyData();
    expect(createEvent).toHaveBeenCalledTimes(UPCOMING_EVENTS.length + PAST_EVENTS.length);
  });

  it('creates upcoming events with status "upcoming" and a buttons array from ctaLabel/ctaHref', async () => {
    await seedLegacyData();
    const firstUpcoming = UPCOMING_EVENTS[0];
    expect(createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: firstUpcoming.title,
        status: 'upcoming',
        image: firstUpcoming.image,
        storagePath: null,
        buttons: [{ label: firstUpcoming.ctaLabel, url: firstUpcoming.ctaHref }],
      })
    );
  });

  it('creates past events with status "past" and no buttons', async () => {
    await seedLegacyData();
    const firstPast = PAST_EVENTS[0];
    expect(createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: firstPast.title,
        status: 'past',
        image: firstPast.image,
        storagePath: null,
        buttons: [],
      })
    );
  });

  it('creates one gallery category per legacy gallery section, from its existing image URLs', async () => {
    await seedLegacyData();
    expect(createCategoryFromUrls).toHaveBeenCalledTimes(GALLERY_SECTIONS.length);
    const firstSection = GALLERY_SECTIONS[0];
    expect(createCategoryFromUrls).toHaveBeenCalledWith(firstSection.title, firstSection.images);
  });
});
