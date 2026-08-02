import { Schema } from 'firebase/ai';

/**
 * Prompts for critiquing a coding-problem submission: `{ problem: {title,
 * difficulty, pattern}, language, code }`, built from data already on hand
 * (the problem's entry in `data/codingWeeks.json` and whatever's in the
 * editor) — there's no compiler or test run behind this, so the model reads
 * the code the way an interviewer would from a whiteboard.
 *
 * Mirrors `ai/designCritique.js`: pure prompt builders (testable without
 * `firebase/ai`), `request*` functions that touch the model.
 */
const INTERVIEWER_PREAMBLE =
  'You are a staff engineer interviewing a candidate on a coding problem. Below is ' +
  'the problem and the code the candidate has written so far.';

function describeSubmission(submission) {
  const { problem, language, code } = submission;
  const lines = [`Problem: ${problem.title} (${problem.difficulty})`];
  if (problem.pattern) lines.push(`Pattern: ${problem.pattern}`);
  lines.push(`Language: ${language}`);
  lines.push('Code:');
  lines.push(code.trim() || '(nothing written yet)');
  return lines.join('\n');
}

function describeSessionSoFar(context) {
  const already = [...(context?.questions ?? []), ...(context?.hints ?? [])];
  if (already.length === 0) return '';
  return `\n\nAlready raised earlier in this session — do not repeat these:\n- ${already.join('\n- ')}`;
}

export function buildFollowUpPrompt(submission) {
  if (!submission.code.trim()) {
    return (
      `${INTERVIEWER_PREAMBLE}\n\nThe candidate has not written any code yet. ` +
      'Return an empty questions array.'
    );
  }
  return (
    `${INTERVIEWER_PREAMBLE}\n\n${describeSubmission(submission)}\n\n` +
    'Identify what this solution has not addressed yet — for example edge cases, ' +
    'correctness bugs, or time/space complexity. If nothing important is missing, ' +
    'return an empty array. Ask at most 4 questions, each one sentence.'
  );
}

export function buildHintPrompt(submission, context) {
  return (
    `${INTERVIEWER_PREAMBLE}\n\n${describeSubmission(submission)}${describeSessionSoFar(context)}\n\n` +
    'Give the candidate one short, specific hint that would help them improve the ' +
    'solution. Do not give away a full solution.'
  );
}

export function buildFeedbackPrompt(submission, context) {
  return (
    `${INTERVIEWER_PREAMBLE}\n\n${describeSubmission(submission)}${describeSessionSoFar(context)}\n\n` +
    'The candidate is done and wants final feedback. Give a score from 0-100, a list ' +
    'of specific strengths, and a list of specific weaknesses. Reference the actual ' +
    'code written rather than speaking generically.'
  );
}

const FOLLOW_UP_SCHEMA = Schema.object({
  properties: { questions: Schema.array({ items: Schema.string() }) },
});

const HINT_SCHEMA = Schema.object({
  properties: { hint: Schema.string() },
});

const FEEDBACK_SCHEMA = Schema.object({
  properties: {
    score: Schema.number(),
    strengths: Schema.array({ items: Schema.string() }),
    weaknesses: Schema.array({ items: Schema.string() }),
  },
});

async function generateJson(prompt, responseSchema) {
  const { generativeModel } = await import('../firebase/ai.js');
  const model = generativeModel({ responseMimeType: 'application/json', responseSchema });
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

export async function requestFollowUpQuestions(submission) {
  const parsed = await generateJson(buildFollowUpPrompt(submission), FOLLOW_UP_SCHEMA);
  return Array.isArray(parsed.questions) ? parsed.questions : [];
}

export async function requestHint(submission, context) {
  const parsed = await generateJson(buildHintPrompt(submission, context), HINT_SCHEMA);
  return typeof parsed.hint === 'string' ? parsed.hint : '';
}

export async function requestFeedback(submission, context) {
  const parsed = await generateJson(buildFeedbackPrompt(submission, context), FEEDBACK_SCHEMA);
  return {
    score: typeof parsed.score === 'number' ? parsed.score : null,
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
  };
}
