import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.js';

const SETTINGS_DOC = doc(db, 'settings', 'site');

const DEFAULTS = {
  sponsorsSectionVisible: true,
};

export function subscribeToSettings(onChange) {
  return onSnapshot(SETTINGS_DOC, (snapshot) => {
    onChange({ ...DEFAULTS, ...(snapshot.exists() ? snapshot.data() : {}) });
  });
}

export async function updateSettings(partialSettings) {
  await setDoc(SETTINGS_DOC, partialSettings, { merge: true });
}
