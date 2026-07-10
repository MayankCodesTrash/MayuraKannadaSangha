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
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase.js';

const CATEGORIES_COLLECTION = 'galleryCategories';

export function subscribeToCategories(onChange) {
  return onSnapshot(collection(db, CATEGORIES_COLLECTION), (snapshot) => {
    const categories = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    onChange(categories);
  });
}

async function uploadCategoryImage(categoryId, file) {
  const storagePath = `gallery/${categoryId}/${file.name}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, storagePath };
}

export async function createCategory(title, files) {
  const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), { title, images: [] });
  const images = [];
  for (const file of files) {
    images.push(await uploadCategoryImage(docRef.id, file));
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
    images.push(await uploadCategoryImage(categoryId, file));
  }
  await updateDoc(doc(db, CATEGORIES_COLLECTION, categoryId), { images: arrayUnion(...images) });
}

export async function removeImageFromCategory(categoryId, image) {
  await updateDoc(doc(db, CATEGORIES_COLLECTION, categoryId), { images: arrayRemove(image) });
  if (image.storagePath) {
    await deleteObject(ref(storage, image.storagePath));
  }
}

export async function deleteCategory(categoryId, images = []) {
  await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
  for (const image of images) {
    if (image.storagePath) {
      await deleteObject(ref(storage, image.storagePath));
    }
  }
}
