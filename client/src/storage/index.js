import seedProgress from '../data/seedProgress.json';
import { normalizeDocument } from './ProgressStore.js';
import { EMPTY_DESIGN } from './DesignStore.js';
import { localStore } from './localStore.js';
import { createFirestoreStore } from './firestoreStore.js';
import { createLocalDesignStore } from './localDesignStore.js';
import { createFirestoreDesignStore } from './firestoreDesignStore.js';

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

/**
 * Picks the backend for one chapter's design, on the same rule as progress:
 * signed in means Firestore, otherwise localStorage.
 */
export function createDesignStore(user, chapterId) {
  return user
    ? createFirestoreDesignStore(user.uid, chapterId)
    : createLocalDesignStore(chapterId);
}

/**
 * Reads a chapter's design, falling back to an empty canvas.
 *
 * Unlike progress there is nothing to seed, and nothing is written here: just
 * opening a chapter should not create a document for a design that does not
 * exist yet. The first write happens when the user actually draws something.
 */
export async function loadDesign(store) {
  const existing = await store.read();
  return existing ?? structuredClone(EMPTY_DESIGN);
}
