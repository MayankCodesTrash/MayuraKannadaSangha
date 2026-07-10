import { describe, it, expect, vi, beforeEach } from 'vitest';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import {
  subscribeToCategories,
  createCategory,
  createCategoryFromUrls,
  renameCategory,
  addImagesToCategory,
  removeImageFromCategory,
  deleteCategory,
} from './galleryRepo.js';

beforeEach(() => {
  vi.mocked(collection).mockClear().mockReturnValue('categories-collection-ref');
  vi.mocked(doc).mockClear().mockReturnValue('category-doc-ref');
  vi.mocked(addDoc).mockClear();
  vi.mocked(updateDoc).mockClear();
  vi.mocked(deleteDoc).mockClear();
  vi.mocked(onSnapshot).mockClear();
  vi.mocked(arrayUnion).mockClear();
  vi.mocked(arrayRemove).mockClear();
  vi.mocked(ref).mockClear().mockReturnValue('storage-ref');
  vi.mocked(uploadBytes).mockClear();
  vi.mocked(getDownloadURL).mockClear();
  vi.mocked(deleteObject).mockClear();
});

describe('galleryRepo', () => {
  it('subscribeToCategories maps snapshot docs to plain category objects with id', () => {
    const handler = vi.fn();
    let capturedCallback;
    vi.mocked(onSnapshot).mockImplementation((ref, callback) => {
      capturedCallback = callback;
      return 'unsubscribe-fn';
    });

    const unsubscribe = subscribeToCategories(handler);
    capturedCallback({
      docs: [{ id: 'cat-1', data: () => ({ title: 'Dasara', images: [] }) }],
    });

    expect(handler).toHaveBeenCalledWith([{ id: 'cat-1', title: 'Dasara', images: [] }]);
    expect(unsubscribe).toBe('unsubscribe-fn');
  });

  it('createCategory uploads every file and creates a doc with the resulting images', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'new-cat-id' });
    vi.mocked(getDownloadURL)
      .mockResolvedValueOnce('https://example.com/a.jpg')
      .mockResolvedValueOnce('https://example.com/b.jpg');
    const files = [
      new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'b.jpg', { type: 'image/jpeg' }),
    ];

    const id = await createCategory('Picnics', files);

    expect(uploadBytes).toHaveBeenCalledTimes(2);
    expect(updateDoc).toHaveBeenCalledWith('category-doc-ref', {
      title: 'Picnics',
      images: [
        { url: 'https://example.com/a.jpg', storagePath: 'gallery/new-cat-id/a.jpg' },
        { url: 'https://example.com/b.jpg', storagePath: 'gallery/new-cat-id/b.jpg' },
      ],
    });
    expect(id).toBe('new-cat-id');
  });

  it('createCategoryFromUrls creates a doc directly from existing URLs with no storagePath', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'legacy-cat-id' });

    const id = await createCategoryFromUrls('Dasara 2024', ['https://example.com/x.jpg']);

    expect(uploadBytes).not.toHaveBeenCalled();
    expect(addDoc).toHaveBeenCalledWith('categories-collection-ref', {
      title: 'Dasara 2024',
      images: [{ url: 'https://example.com/x.jpg', storagePath: null }],
    });
    expect(id).toBe('legacy-cat-id');
  });

  it('renameCategory updates the title field', async () => {
    await renameCategory('cat-1', 'New Title');
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'galleryCategories', 'cat-1');
    expect(updateDoc).toHaveBeenCalledWith('category-doc-ref', { title: 'New Title' });
  });

  it('addImagesToCategory uploads files and appends them with arrayUnion', async () => {
    vi.mocked(getDownloadURL).mockResolvedValue('https://example.com/c.jpg');
    vi.mocked(arrayUnion).mockReturnValue('array-union-result');
    const files = [new File(['c'], 'c.jpg', { type: 'image/jpeg' })];

    await addImagesToCategory('cat-1', files);

    expect(uploadBytes).toHaveBeenCalledTimes(1);
    expect(arrayUnion).toHaveBeenCalledWith({
      url: 'https://example.com/c.jpg',
      storagePath: 'gallery/cat-1/c.jpg',
    });
    expect(updateDoc).toHaveBeenCalledWith('category-doc-ref', { images: 'array-union-result' });
  });

  it('removeImageFromCategory removes the image and deletes its storage object', async () => {
    vi.mocked(arrayRemove).mockReturnValue('array-remove-result');
    const image = { url: 'https://example.com/c.jpg', storagePath: 'gallery/cat-1/c.jpg' };

    await removeImageFromCategory('cat-1', image);

    expect(arrayRemove).toHaveBeenCalledWith(image);
    expect(updateDoc).toHaveBeenCalledWith('category-doc-ref', { images: 'array-remove-result' });
    expect(ref).toHaveBeenCalledWith(expect.anything(), 'gallery/cat-1/c.jpg');
    expect(deleteObject).toHaveBeenCalledWith('storage-ref');
  });

  it('deleteCategory deletes the doc and every image with a storagePath', async () => {
    const images = [
      { url: 'https://example.com/a.jpg', storagePath: 'gallery/cat-1/a.jpg' },
      { url: 'https://example.com/b.jpg', storagePath: null },
    ];

    await deleteCategory('cat-1', images);

    expect(deleteDoc).toHaveBeenCalledWith('category-doc-ref');
    expect(deleteObject).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledWith(expect.anything(), 'gallery/cat-1/a.jpg');
  });
});
