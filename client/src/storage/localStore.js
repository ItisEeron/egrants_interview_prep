import { normalizeDocument } from './ProgressStore.js';

const STORAGE_KEY = 'egrants-interview-prep:progress';

/**
 * Keeps progress in the browser. Used when Firebase is not configured, so the
 * app runs with no setup at all, and as the store for anyone who would rather
 * not sign in.
 *
 * Progress stays on this device and is lost if site data is cleared.
 */
function read() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return Promise.resolve(null);

  try {
    return Promise.resolve(normalizeDocument(JSON.parse(raw)));
  } catch {
    // A corrupt value is worse than none: fall back to seeding a fresh document.
    return Promise.resolve(null);
  }
}

function write(document) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
  return Promise.resolve(document);
}

export const localStore = { name: 'local', read, write };
