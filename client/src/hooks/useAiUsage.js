import { useCallback, useEffect, useState } from 'react';
import { DAILY_AI_CALL_LIMIT, readUsage } from '../ai/rateLimiter.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * The shared AI usage counter, read fresh whenever a caller asks — after
 * every Analyze/Hint/Feedback attempt, not just on mount, so both the design
 * critique and code critique panels stay in sync with the same underlying
 * Firestore document.
 */
export function useAiUsage() {
  const { user } = useAuth();
  const [usage, setUsage] = useState(null);

  const refresh = useCallback(() => {
    if (!user) return;
    readUsage(user.uid)
      .then(setUsage)
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { usage, limit: DAILY_AI_CALL_LIMIT, refresh };
}
