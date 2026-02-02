import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, persistentLocalCache } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // Optional: for Analytics
};

// Initialize Firebase (only if not already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);

// Initialize Firestore with persistent local cache (offline support)
// Handle HMR by checking if already initialized
let db;
try {
  // Try to initialize with persistent cache
  db = initializeFirestore(app, {
    localCache: persistentLocalCache()
  });
} catch (error: any) {
  // If already initialized (e.g., during HMR), get the existing instance
  if (error.code === 'failed-precondition' || error.message?.includes('already been called')) {
    db = getFirestore(app);
  } else {
    // Re-throw other errors
    throw error;
  }
}

export { db };

export default app;

