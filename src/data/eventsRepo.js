import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase.js';

const EVENTS_COLLECTION = 'events';

export function subscribeToEvents(onChange) {
  return onSnapshot(collection(db, EVENTS_COLLECTION), (snapshot) => {
    const events = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    onChange(events);
  });
}

export async function uploadEventImage(eventId, file) {
  const storagePath = `events/${eventId}/${file.name}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file);
  const image = await getDownloadURL(storageRef);
  return { image, storagePath };
}

export async function createEvent(eventData) {
  const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventData);
  return docRef.id;
}

export async function updateEvent(eventId, eventData) {
  await updateDoc(doc(db, EVENTS_COLLECTION, eventId), eventData);
}

export async function deleteEvent(eventId, storagePath) {
  await deleteDoc(doc(db, EVENTS_COLLECTION, eventId));
  if (storagePath) {
    await deleteObject(ref(storage, storagePath));
  }
}
