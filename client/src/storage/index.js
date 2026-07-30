import seedProgress from '../data/seedProgress.json';
import { normalizeDocument } from './ProgressStore.js';
import { localStore } from './localStore.js';
import { createFirestoreStore } from './firestoreStore.js';

/**
 * Picks the backend for a session.
 *
 * A signed-in user gets Firestore; everyone else gets localStorage. Callers
 * only ever see the ProgressStore contract, so nothing above this layer knows
 * which one it got.
 */
export function createProgressStore(user) {
  return user ? createFirestoreStore(user.uid) : localStore;
}

/**
 * Reads the stored document, seeding it on first use.
 *
 * A brand new store has nothing in it, so it starts from the progress already
 * recorded in the workbooks and writes that back — the same first-run behaviour
 * the server used to provide.
 */
export async function loadProgress(store) {
  const existing = await store.read();
  if (existing) return existing;

  const seeded = normalizeDocument(seedProgress);
  await store.write(seeded);
  return seeded;
}
