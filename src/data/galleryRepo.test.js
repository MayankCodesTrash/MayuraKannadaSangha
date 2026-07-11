import { describe, it, expect, vi, beforeEach } from 'vitest';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, arrayUnion, arrayRemove } from 'firebase/firestore';
import { uploadImage } from '../cloudinary.js';
import {
  subscribeToCategories,
  createCategory,
  createCategoryFromUrls,
  renameCategory,
  addImagesToCategory,
  removeImageFromCategory,
  deleteCategory,
} from './galleryRepo.js';

vi.mock('../cloudinary.js', () => ({
  uploadImage: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(collection).mockClear().mockReturnValue('categories-collection-ref');
  vi.mocked(doc).mockClear().mockReturnValue('category-doc-ref');
  vi.mocked(addDoc).mockClear();
  vi.mocked(updateDoc).mockClear();
  vi.mocked(deleteDoc).mockClear();
  vi.mocked(onSnapshot).mockClear();
  vi.mocked(arrayUnion).mockClear();
  vi.mocked(arrayRemove).mockClear();
  vi.mocked(uploadImage).mockClear();
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

  it('createCategory uploads every file via Cloudinary and creates a doc with the resulting images', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'new-cat-id' });
    vi.mocked(uploadImage)
      .mockResolvedValueOnce({ url: 'https://res.cloudinary.com/demo/image/upload/a.jpg', publicId: 'a' })
      .mockResolvedValueOnce({ url: 'https://res.cloudinary.com/demo/image/upload/b.jpg', publicId: 'b' });
    const files = [
      new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'b.jpg', { type: 'image/jpeg' }),
    ];

    const id = await createCategory('Picnics', files);

    expect(uploadImage).toHaveBeenCalledTimes(2);
    expect(updateDoc).toHaveBeenCalledWith('category-doc-ref', {
      title: 'Picnics',
      images: [
        { url: 'https://res.cloudinary.com/demo/image/upload/a.jpg', storagePath: 'a' },
        { url: 'https://res.cloudinary.com/demo/image/upload/b.jpg', storagePath: 'b' },
      ],
    });
    expect(id).toBe('new-cat-id');
  });

  it('createCategoryFromUrls creates a doc directly from existing URLs with no storagePath', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'legacy-cat-id' });

    const id = await createCategoryFromUrls('Dasara 2024', ['https://example.com/x.jpg']);

    expect(uploadImage).not.toHaveBeenCalled();
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

  it('addImagesToCategory uploads files via Cloudinary and appends them with arrayUnion', async () => {
    vi.mocked(uploadImage).mockResolvedValue({
      url: 'https://res.cloudinary.com/demo/image/upload/c.jpg',
      publicId: 'c',
    });
    vi.mocked(arrayUnion).mockReturnValue('array-union-result');
    const files = [new File(['c'], 'c.jpg', { type: 'image/jpeg' })];

    await addImagesToCategory('cat-1', files);

    expect(uploadImage).toHaveBeenCalledTimes(1);
    expect(arrayUnion).toHaveBeenCalledWith({
      url: 'https://res.cloudinary.com/demo/image/upload/c.jpg',
      storagePath: 'c',
    });
    expect(updateDoc).toHaveBeenCalledWith('category-doc-ref', { images: 'array-union-result' });
  });

  it('removeImageFromCategory removes the image from the doc', async () => {
    vi.mocked(arrayRemove).mockReturnValue('array-remove-result');
    const image = { url: 'https://res.cloudinary.com/demo/image/upload/c.jpg', storagePath: 'c' };

    await removeImageFromCategory('cat-1', image);

    expect(arrayRemove).toHaveBeenCalledWith(image);
    expect(updateDoc).toHaveBeenCalledWith('category-doc-ref', { images: 'array-remove-result' });
  });

  it('deleteCategory deletes the doc', async () => {
    await deleteCategory('cat-1');
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'galleryCategories', 'cat-1');
    expect(deleteDoc).toHaveBeenCalledWith('category-doc-ref');
  });
});
