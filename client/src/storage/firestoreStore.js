import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../firebase/app.js';
import { normalizeDocument } from './ProgressStore.js';

/**
 * Keeps progress in Firestore at `users/{uid}`, so it follows the signed-in
 * account across devices.
 *
 * The progress document is stored as a JSON string in a single `document`
 * field rather than as nested Firestore maps. Its keys are workbook ids
 * (problem ids, checklist item ids) and Firestore restricts what a field name
 * may contain; serialising sidesteps that entirely and keeps what is written
 * identical to what every other backend writes. The whole document is a few
 * kilobytes, far below Firestore's 1 MiB per-document limit.
 */
export function createFirestoreStore(uid) {
  const reference = () => doc(firestore(), 'users', uid);

  async function read() {
    const snapshot = await getDoc(reference());
    if (!snapshot.exists()) return null;

    const { document: serialized } = snapshot.data();
    if (typeof serialized !== 'string') return null;

    try {
      return normalizeDocument(JSON.parse(serialized));
    } catch {
      // A corrupt value is worse than none: fall back to seeding a fresh document.
      return null;
    }
  }

  async function write(document) {
    await setDoc(reference(), {
      document: JSON.stringify(document),
      updatedAt: new Date().toISOString(),
    });
    return document;
  }

  return { name: 'firestore', read, write };
}
