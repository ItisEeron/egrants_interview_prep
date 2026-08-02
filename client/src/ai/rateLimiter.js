/**
 * A shared daily cap on AI calls (design critique and code critique both go
 * through this), tracked in Firestore at `users/{uid}/meta/aiUsage` rather
 * than enforced server-side — good enough while this is single-user; a public
 * deployment would want a server-side check too, not just this.
 *
 * The decision logic (`nextUsageState`) is factored out of the Firestore call
 * so it's testable without a database: given what's currently stored (or
 * nothing) and the current time, decide whether this call is allowed and what
 * should be written back. `checkAndIncrementUsage`/`readUsage` are the only
 * places that touch Firestore, imported lazily rather than at module scope —
 * same reasoning as `ai/designCritique.js`: importing `firebase/app.js`
 * pulls in `firebase/config.js`, which reads `import.meta.env`, populated by
 * Vite but not by the plain `node --test` runner these tests run under.
 */
/**
 * Set to catch a runaway loop, not to stay under Google's quota — even the
 * most pessimistic published free-tier figure is far above what one person
 * clicking buttons reaches. At roughly 3-6 calls per problem this covers a
 * heavy session (8-15 problems) and still trips long before anything alarming.
 */
export const DAILY_AI_CALL_LIMIT = 50;

function todayKey(now) {
  return now.toISOString().slice(0, 10);
}

export function nextUsageState(stored, now = new Date()) {
  const today = todayKey(now);
  const count = stored?.day === today ? stored.count : 0;

  if (count >= DAILY_AI_CALL_LIMIT) {
    return { allowed: false, remaining: 0, next: { day: today, count } };
  }

  const nextCount = count + 1;
  return {
    allowed: true,
    remaining: DAILY_AI_CALL_LIMIT - nextCount,
    next: { day: today, count: nextCount },
  };
}

async function usageDoc(uid) {
  const [{ firestore }, { doc }] = await Promise.all([import('../firebase/app.js'), import('firebase/firestore')]);
  return doc(firestore(), 'users', uid, 'meta', 'aiUsage');
}

export async function checkAndIncrementUsage(uid) {
  const [ref, { runTransaction }, { firestore }] = await Promise.all([
    usageDoc(uid),
    import('firebase/firestore'),
    import('../firebase/app.js'),
  ]);

  let outcome;
  await runTransaction(firestore(), async (transaction) => {
    const snapshot = await transaction.get(ref);
    outcome = nextUsageState(snapshot.exists() ? snapshot.data() : null);
    if (outcome.allowed) transaction.set(ref, outcome.next);
  });
  return outcome;
}

export async function readUsage(uid) {
  const [ref, { getDoc }] = await Promise.all([usageDoc(uid), import('firebase/firestore')]);
  const snapshot = await getDoc(ref);
  const stored = snapshot.exists() ? snapshot.data() : null;
  const count = stored?.day === todayKey(new Date()) ? stored.count : 0;
  return { count, limit: DAILY_AI_CALL_LIMIT, remaining: DAILY_AI_CALL_LIMIT - count };
}
