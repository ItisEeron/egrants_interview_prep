import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from './config.js';

/**
 * Creates the Firebase app once, on first use.
 *
 * Initialisation is deferred rather than done at module load so that importing
 * anything from this folder is safe when Firebase is not configured — the
 * localStorage path never calls these.
 */
let app;

export function firebaseApp() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Set the VITE_FIREBASE_* environment variables.');
  }
  app ??= initializeApp(firebaseConfig);
  return app;
}

export function firebaseAuth() {
  return getAuth(firebaseApp());
}

export function firestore() {
  return getFirestore(firebaseApp());
}
