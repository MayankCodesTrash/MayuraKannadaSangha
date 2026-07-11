import { describe, it, expect, vi, beforeEach } from 'vitest';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { uploadImage } from '../cloudinary.js';
import {
  subscribeToEvents,
  uploadEventImage,
  createEvent,
  updateEvent,
  deleteEvent,
} from './eventsRepo.js';

vi.mock('../cloudinary.js', () => ({
  uploadImage: vi.fn(() =>
    Promise.resolve({ url: 'https://res.cloudinary.com/demo/image/upload/photo.jpg', publicId: 'photo' })
  ),
}));

beforeEach(() => {
  vi.mocked(collection).mockClear().mockReturnValue('events-collection-ref');
  vi.mocked(doc).mockClear().mockReturnValue('event-doc-ref');
  vi.mocked(addDoc).mockClear();
  vi.mocked(updateDoc).mockClear();
  vi.mocked(deleteDoc).mockClear();
  vi.mocked(onSnapshot).mockClear();
  vi.mocked(uploadImage).mockClear();
});

describe('eventsRepo', () => {
  it('subscribeToEvents maps snapshot docs to plain event objects with id', () => {
    const handler = vi.fn();
    let capturedCallback;
    vi.mocked(onSnapshot).mockImplementation((ref, callback) => {
      capturedCallback = callback;
      return 'unsubscribe-fn';
    });

    const unsubscribe = subscribeToEvents(handler);
    capturedCallback({
      docs: [
        { id: 'evt-1', data: () => ({ title: 'Dasara' }) },
        { id: 'evt-2', data: () => ({ title: 'Picnic' }) },
      ],
    });

    expect(handler).toHaveBeenCalledWith([
      { id: 'evt-1', title: 'Dasara' },
      { id: 'evt-2', title: 'Picnic' },
    ]);
    expect(unsubscribe).toBe('unsubscribe-fn');
  });

  it('uploadEventImage uploads the file via Cloudinary and returns its url and public id', async () => {
    vi.mocked(uploadImage).mockResolvedValue({
      url: 'https://res.cloudinary.com/demo/image/upload/photo.jpg',
      publicId: 'photo',
    });
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });

    const result = await uploadEventImage(file);

    expect(uploadImage).toHaveBeenCalledWith(file);
    expect(result).toEqual({
      image: 'https://res.cloudinary.com/demo/image/upload/photo.jpg',
      storagePath: 'photo',
    });
  });

  it('createEvent adds a document to the events collection and returns its id', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'new-evt-id' });

    const id = await createEvent({ title: 'New Event', buttons: [] });

    expect(collection).toHaveBeenCalledWith(expect.anything(), 'events');
    expect(addDoc).toHaveBeenCalledWith(
      'events-collection-ref',
      expect.objectContaining({ title: 'New Event', buttons: [] })
    );
    expect(id).toBe('new-evt-id');
  });

  it('updateEvent updates the given event document', async () => {
    await updateEvent('evt-1', { title: 'Updated' });
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'events', 'evt-1');
    expect(updateDoc).toHaveBeenCalledWith('event-doc-ref', { title: 'Updated' });
  });

  it('deleteEvent deletes the document', async () => {
    await deleteEvent('evt-1');
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'events', 'evt-1');
    expect(deleteDoc).toHaveBeenCalledWith('event-doc-ref');
  });
});
