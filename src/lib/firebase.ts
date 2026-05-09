import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export const isFirebaseConfigured = requiredConfigKeys.every(key => Boolean(firebaseConfig[key]));

export const getFirebaseAuth = () => {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured yet.');
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
  }

  if (!auth) {
    auth = getAuth(app);
  }

  return auth;
};
