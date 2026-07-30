import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDocs } from 'firebase/firestore';
import { createEvent } from '../data/eventsRepo.js';
import { createCategoryFromUrls } from '../data/galleryRepo.js';
import { createTeamMember } from '../data/teamRepo.js';
import { UPCOMING_EVENTS } from '../data/upcomingEvents.js';
import { PAST_EVENTS } from '../data/pastEvents.js';
import { GALLERY_SECTIONS } from '../data/gallerySections.js';
import { DEFAULT_OFFICE_BEARERS } from '../data/officeBearers.js';
import { seedLegacyData } from './seedLegacyData.js';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ empty: true })),
}));
vi.mock('../firebase.js', () => ({ db: {} }));
vi.mock('../data/eventsRepo.js', () => ({ createEvent: vi.fn(() => Promise.resolve('evt-id')) }));
vi.mock('../data/galleryRepo.js', () => ({
  createCategoryFromUrls: vi.fn(() => Promise.resolve('cat-id')),
}));
vi.mock('../data/teamRepo.js', () => ({
  createTeamMember: vi.fn(() => Promise.resolve('member-id')),
}));

beforeEach(() => {
  vi.mocked(getDocs).mockClear().mockResolvedValue({ empty: true });
  vi.mocked(createEvent).mockClear();
  vi.mocked(createCategoryFromUrls).mockClear();
  vi.mocked(createTeamMember).mockClear();
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

  it('creates one team member per default office bearer', async () => {
    await seedLegacyData();
    expect(createTeamMember).toHaveBeenCalledTimes(DEFAULT_OFFICE_BEARERS.length);
    const first = DEFAULT_OFFICE_BEARERS[0];
    expect(createTeamMember).toHaveBeenCalledWith(
      expect.objectContaining({
        name: first.name,
        role: first.role,
        order: first.order,
        image: '',
        storagePath: null,
      })
    );
  });

  it('skips seeding a collection that already has data, and reports it as skipped', async () => {
    vi.mocked(getDocs).mockResolvedValue({ empty: false });
    const result = await seedLegacyData();
    expect(createEvent).not.toHaveBeenCalled();
    expect(createCategoryFromUrls).not.toHaveBeenCalled();
    expect(createTeamMember).not.toHaveBeenCalled();
    expect(result.skipped).toHaveLength(3);
  });
});
