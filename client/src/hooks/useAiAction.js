import { useState } from 'react';
import { checkAndIncrementUsage } from '../ai/rateLimiter.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useAiUsage } from './useAiUsage.js';

const ERROR_MESSAGE = "Couldn't reach the AI just now — try again in a moment.";
const LIMIT_MESSAGE = 'Daily AI limit reached — resets at midnight UTC.';

/**
 * The plumbing shared by every AI critique panel (design and code): pending/
 * error state, and the rate-limit check that has to run before every actual
 * request. Centralised here rather than duplicated per panel, since the cap
 * is shared across both — a call spent on one counts against the other.
 */
export function useAiAction() {
  const { user } = useAuth();
  const { usage, limit, refresh } = useAiUsage();
  const [pending, setPending] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  async function run(action, task) {
    setPending(action);
    setErrorMessage(null);
    try {
      const outcome = await checkAndIncrementUsage(user.uid);
      refresh();
      if (!outcome.allowed) {
        setErrorMessage(LIMIT_MESSAGE);
        return;
      }
      await task();
    } catch (error) {
      console.error('AI critique request failed:', error);
      setErrorMessage(ERROR_MESSAGE);
    } finally {
      setPending(null);
    }
  }

  return { run, pending, errorMessage, usage, limit };
}
