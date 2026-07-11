import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.js';
import { uploadImage } from '../cloudinary.js';

const EVENTS_COLLECTION = 'events';

export function subscribeToEvents(onChange) {
  return onSnapshot(collection(db, EVENTS_COLLECTION), (snapshot) => {
    const events = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    onChange(events);
  });
}

export async function uploadEventImage(file) {
  const { url, publicId } = await uploadImage(file);
  return { image: url, storagePath: publicId };
}

export async function createEvent(eventData) {
  const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventData);
  return docRef.id;
}

export async function updateEvent(eventId, eventData) {
  await updateDoc(doc(db, EVENTS_COLLECTION, eventId), eventData);
}

export async function deleteEvent(eventId) {
  await deleteDoc(doc(db, EVENTS_COLLECTION, eventId));
}
