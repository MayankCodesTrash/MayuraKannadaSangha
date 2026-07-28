import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.js';
import { uploadImage } from '../cloudinary.js';

const SPONSORS_COLLECTION = 'sponsors';

export function subscribeToSponsors(onChange) {
  return onSnapshot(collection(db, SPONSORS_COLLECTION), (snapshot) => {
    const sponsors = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    onChange(sponsors);
  });
}

export async function uploadSponsorPhoto(file) {
  const { url, publicId } = await uploadImage(file);
  return { image: url, storagePath: publicId };
}

export async function createSponsor(sponsorData) {
  const docRef = await addDoc(collection(db, SPONSORS_COLLECTION), sponsorData);
  return docRef.id;
}

export async function updateSponsor(sponsorId, sponsorData) {
  await updateDoc(doc(db, SPONSORS_COLLECTION, sponsorId), sponsorData);
}

export async function deleteSponsor(sponsorId) {
  await deleteDoc(doc(db, SPONSORS_COLLECTION, sponsorId));
}
