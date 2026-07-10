import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyD320kEy8HqhxaQxvR95jGvxBi0HlElos4',
  authDomain: 'kannadasangha-83770.firebaseapp.com',
  projectId: 'kannadasangha-83770',
  storageBucket: 'kannadasangha-83770.firebasestorage.app',
  messagingSenderId: '342235429903',
  appId: '1:342235429903:web:f6d2845cf57a108fe1777a',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
