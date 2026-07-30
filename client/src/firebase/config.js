/**
 * Firebase project settings, read from the build environment.
 *
 * These values are not secrets. A Firebase web config identifies the project;
 * it does not grant access to anything. Access is decided by Firestore security
 * rules (see `firestore.rules`), which only let a signed-in user touch their own
 * document. They are supplied through the build environment so the same source
 * can point at a different project without editing code.
 *
 * When they are absent the app runs against localStorage instead, so a fresh
 * clone works with no setup.
 */
const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

/** The three values Firestore and Google sign-in cannot work without. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId,
);
