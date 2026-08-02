import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildFeedbackPrompt, buildFollowUpPrompt, buildHintPrompt } from './designCritique.js';

const emptyDescription = {
  chapter: null,
  components: [],
  connections: [],
  countsByKind: {},
  unconnected: [],
  notes: '',
};

const description = {
  chapter: { id: 'ch-1', title: 'Design a URL shortener' },
  components: [{ id: 'a', kind: 'service', kindLabel: 'Service', label: 'API', detail: 'Go' }],
  connections: [{ from: 'API', to: 'Database', label: 'writes' }],
  countsByKind: { service: 1 },
  unconnected: ['Database'],
  notes: '10M DAU',
};

describe('buildFollowUpPrompt', () => {
  it('asks for an empty array when nothing has been drawn', () => {
    const prompt = buildFollowUpPrompt(emptyDescription);
    assert.match(prompt, /has not drawn anything/);
    assert.match(prompt, /empty questions array/);
  });

  it('includes the components, connections, and notes actually drawn', () => {
    const prompt = buildFollowUpPrompt(description);
    assert.match(prompt, /API \(Service\): Go/);
    assert.match(prompt, /API -> Database \(writes\)/);
    assert.match(prompt, /10M DAU/);
  });
});

describe('buildHintPrompt', () => {
  it('has no "already raised" section with no prior session context', () => {
    const prompt = buildHintPrompt(description, undefined);
    assert.doesNotMatch(prompt, /Already raised/);
  });

  it('lists prior questions and hints so the model does not repeat itself', () => {
    const prompt = buildHintPrompt(description, {
      questions: ['What happens if the database goes down?'],
      hints: ['Consider a read replica.'],
    });
    assert.match(prompt, /What happens if the database goes down\?/);
    assert.match(prompt, /Consider a read replica\./);
  });
});

describe('buildFeedbackPrompt', () => {
  it('asks for a score, strengths, and weaknesses', () => {
    const prompt = buildFeedbackPrompt(description, undefined);
    assert.match(prompt, /score from 0-100/);
    assert.match(prompt, /strengths/);
    assert.match(prompt, /weaknesses/);
  });
});
