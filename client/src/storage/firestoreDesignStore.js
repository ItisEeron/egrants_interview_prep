import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../firebase/app.js';
import { normalizeDesign, toStoredDesign } from './DesignStore.js';

/**
 * Keeps designs in Firestore at `users/{uid}/designs/{chapterId}`, so they
 * follow the signed-in account across devices.
 *
 * Like progress, the design is stored as a JSON string in a single `design`
 * field rather than as nested Firestore maps. Firestore rejects `undefined`
 * outright, and an edge with no label or no explicit handle carries exactly
 * that; serialising drops those keys instead of failing the write. It also
 * keeps what is stored here byte-identical to what every other backend stores.
 *
 * Note that `firestore.rules` needs an explicit match for this subcollection —
 * rules on `users/{userId}` do not cascade to documents beneath it.
 */
export function createFirestoreDesignStore(uid, chapterId) {
  const reference = () => doc(firestore(), 'users', uid, 'designs', chapterId);

  async function read() {
    const snapshot = await getDoc(reference());
    if (!snapshot.exists()) return null;

    const { design: serialized } = snapshot.data();
    if (typeof serialized !== 'string') return null;

    try {
      return normalizeDesign(JSON.parse(serialized));
    } catch {
      // A corrupt value is worse than none: fall back to an empty canvas.
      return null;
    }
  }

  async function write(design) {
    await setDoc(reference(), {
      design: JSON.stringify(toStoredDesign(design)),
      updatedAt: new Date().toISOString(),
    });
    return design;
  }

  return { name: 'firestore-design', read, write };
}
