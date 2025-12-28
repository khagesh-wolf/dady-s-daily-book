import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// TODO: PASTE YOUR FIREBASE CONFIG KEYS HERE
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services with offline cache
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({})
});

const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };