import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// --- PASTE YOUR FIREBASE CONFIG OBJECT HERE ---
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
// ---------------------------------------------

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- THIS IS THE OFFLINE FIX ---
// This enables offline data persistence.
// It will cache data locally and make your app work offline.
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // This can happen if you have multiple tabs open.
      // Persistence will only be enabled in one tab.
      console.warn("Firestore: Multiple tabs open, persistence can only be enabled in one.");
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the features required.
      console.warn("Firestore: This browser does not support offline persistence.");
    }
  });