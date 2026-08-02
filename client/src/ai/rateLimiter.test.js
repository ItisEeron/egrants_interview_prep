import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DAILY_AI_CALL_LIMIT, nextUsageState } from './rateLimiter.js';

const NOW = new Date('2026-08-02T12:00:00Z');

describe('nextUsageState', () => {
  it('starts a fresh count at 1 when nothing is stored yet', () => {
    const outcome = nextUsageState(null, NOW);
    assert.deepEqual(outcome, {
      allowed: true,
      remaining: DAILY_AI_CALL_LIMIT - 1,
      next: { day: '2026-08-02', count: 1 },
    });
  });

  it('increments within the same day', () => {
    const outcome = nextUsageState({ day: '2026-08-02', count: 5 }, NOW);
    assert.equal(outcome.allowed, true);
    assert.deepEqual(outcome.next, { day: '2026-08-02', count: 6 });
  });

  it('resets the count when the stored day is not today', () => {
    const outcome = nextUsageState({ day: '2026-08-01', count: DAILY_AI_CALL_LIMIT }, NOW);
    assert.equal(outcome.allowed, true);
    assert.deepEqual(outcome.next, { day: '2026-08-02', count: 1 });
  });

  it('disallows the call once the limit is reached, without incrementing', () => {
    const outcome = nextUsageState({ day: '2026-08-02', count: DAILY_AI_CALL_LIMIT }, NOW);
    assert.deepEqual(outcome, {
      allowed: false,
      remaining: 0,
      next: { day: '2026-08-02', count: DAILY_AI_CALL_LIMIT },
    });
  });

  it('allows exactly the limit-th call', () => {
    const outcome = nextUsageState({ day: '2026-08-02', count: DAILY_AI_CALL_LIMIT - 1 }, NOW);
    assert.equal(outcome.allowed, true);
    assert.equal(outcome.next.count, DAILY_AI_CALL_LIMIT);
  });
});
