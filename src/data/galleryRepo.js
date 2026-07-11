import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { uploadImage } from '../cloudinary.js';

const CATEGORIES_COLLECTION = 'galleryCategories';

export function subscribeToCategories(onChange) {
  return onSnapshot(collection(db, CATEGORIES_COLLECTION), (snapshot) => {
    const categories = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    onChange(categories);
  });
}

async function uploadCategoryImage(file) {
  const { url, publicId } = await uploadImage(file);
  return { url, storagePath: publicId };
}

export async function createCategory(title, files) {
  const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), { title, images: [] });
  const images = [];
  for (const file of files) {
    images.push(await uploadCategoryImage(file));
  }
  await updateDoc(doc(db, CATEGORIES_COLLECTION, docRef.id), { title, images });
  return docRef.id;
}

export async function createCategoryFromUrls(title, imageUrls) {
  const images = imageUrls.map((url) => ({ url, storagePath: null }));
  const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), { title, images });
  return docRef.id;
}

export async function renameCategory(categoryId, title) {
  await updateDoc(doc(db, CATEGORIES_COLLECTION, categoryId), { title });
}

export async function addImagesToCategory(categoryId, files) {
  const images = [];
  for (const file of files) {
    images.push(await uploadCategoryImage(file));
  }
  await updateDoc(doc(db, CATEGORIES_COLLECTION, categoryId), { images: arrayUnion(...images) });
}

export async function removeImageFromCategory(categoryId, image) {
  await updateDoc(doc(db, CATEGORIES_COLLECTION, categoryId), { images: arrayRemove(image) });
}

export async function deleteCategory(categoryId) {
  await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
}
