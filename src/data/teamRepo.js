import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.js';
import { uploadImage } from '../cloudinary.js';

const TEAM_COLLECTION = 'team';

export function subscribeToTeam(onChange) {
  return onSnapshot(collection(db, TEAM_COLLECTION), (snapshot) => {
    const members = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    onChange(members);
  });
}

export async function uploadTeamPhoto(file) {
  const { url, publicId } = await uploadImage(file);
  return { image: url, storagePath: publicId };
}

export async function createTeamMember(memberData) {
  const docRef = await addDoc(collection(db, TEAM_COLLECTION), memberData);
  return docRef.id;
}

export async function updateTeamMember(memberId, memberData) {
  await updateDoc(doc(db, TEAM_COLLECTION, memberId), memberData);
}

export async function deleteTeamMember(memberId) {
  await deleteDoc(doc(db, TEAM_COLLECTION, memberId));
}
