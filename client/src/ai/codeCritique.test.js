import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildFeedbackPrompt, buildFollowUpPrompt, buildHintPrompt } from './codeCritique.js';

const problem = { title: 'Two Sum', difficulty: 'Easy', pattern: 'Hash Map' };

describe('buildFollowUpPrompt', () => {
  it('asks for an empty array when no code has been written', () => {
    const prompt = buildFollowUpPrompt({ problem, language: 'python', code: '   ' });
    assert.match(prompt, /has not written any code yet/);
    assert.match(prompt, /empty questions array/);
  });

  it('includes the problem, language, and code as written', () => {
    const code = 'def twoSum(self, nums, target):\n    pass';
    const prompt = buildFollowUpPrompt({ problem, language: 'python', code });
    assert.match(prompt, /Two Sum \(Easy\)/);
    assert.match(prompt, /Pattern: Hash Map/);
    assert.match(prompt, /Language: python/);
    assert.match(prompt, /def twoSum/);
  });
});

describe('buildHintPrompt', () => {
  it('has no "already raised" section with no prior session context', () => {
    const prompt = buildHintPrompt({ problem, language: 'java', code: 'class Solution {}' }, undefined);
    assert.doesNotMatch(prompt, /Already raised/);
  });

  it('lists prior questions and hints so the model does not repeat itself', () => {
    const prompt = buildHintPrompt(
      { problem, language: 'java', code: 'class Solution {}' },
      { questions: ['What about duplicate values?'], hints: ['Consider a hash map.'] },
    );
    assert.match(prompt, /What about duplicate values\?/);
    assert.match(prompt, /Consider a hash map\./);
  });
});

describe('buildFeedbackPrompt', () => {
  it('asks for a score, strengths, and weaknesses', () => {
    const prompt = buildFeedbackPrompt({ problem, language: 'cpp', code: 'class Solution {};' }, undefined);
    assert.match(prompt, /score from 0-100/);
    assert.match(prompt, /strengths/);
    assert.match(prompt, /weaknesses/);
  });
});
