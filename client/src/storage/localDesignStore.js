import { normalizeDesign, toStoredDesign } from './DesignStore.js';

/**
 * Keeps one chapter's design in the browser, used when Firebase is not
 * configured or nobody is signed in.
 *
 * Each chapter gets its own key so reading one design does not parse them all.
 * The design stays on this device and is lost if site data is cleared.
 */
const keyFor = (chapterId) => `egrants-interview-prep:design:${chapterId}`;

export function createLocalDesignStore(chapterId) {
  const storageKey = keyFor(chapterId);

  function read() {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return Promise.resolve(null);

    try {
      return Promise.resolve(normalizeDesign(JSON.parse(raw)));
    } catch {
      // A corrupt value is worse than none: fall back to an empty canvas.
      return Promise.resolve(null);
    }
  }

  function write(design) {
    window.localStorage.setItem(storageKey, JSON.stringify(toStoredDesign(design)));
    return Promise.resolve(design);
  }

  return { name: 'local-design', read, write };
}
