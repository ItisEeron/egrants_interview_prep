import { Schema } from 'firebase/ai';

/**
 * Prompts for critiquing a system design, built from `describeDesign()`'s
 * output (see `client/src/analysis/describeDesign.js`).
 *
 * The prompt builders are pure — no network, no Firebase — so they can be
 * tested without mocking `firebase/ai`. `../firebase/ai.js` is imported
 * lazily inside `generateJson`, below, rather than at module scope: it pulls
 * in `firebase/config.js`, which reads `import.meta.env` — populated by Vite,
 * but not by the plain `node --test` runner these tests run under.
 */
const INTERVIEWER_PREAMBLE =
  "You are a staff engineer interviewing a candidate on a system design problem. " +
  "Below is a plain-text description of the candidate's current whiteboard: the " +
  'components they have drawn, how those components connect, and any notes they wrote.';

function describeContext(description) {
  const lines = [];

  if (description.chapter) lines.push(`Chapter: ${description.chapter.title}`);

  lines.push(`Components (${description.components.length}):`);
  for (const component of description.components) {
    const detail = component.detail ? `: ${component.detail}` : '';
    lines.push(`- ${component.label} (${component.kindLabel})${detail}`);
  }

  lines.push(`Connections (${description.connections.length}):`);
  for (const connection of description.connections) {
    const label = connection.label ? ` (${connection.label})` : '';
    lines.push(`- ${connection.from} -> ${connection.to}${label}`);
  }

  if (description.unconnected.length > 0) {
    lines.push(`Drawn but not connected to anything: ${description.unconnected.join(', ')}`);
  }

  lines.push(description.notes ? `Candidate's notes: ${description.notes}` : "Candidate's notes: (none)");

  return lines.join('\n');
}

function describeSessionSoFar(context) {
  const already = [...(context?.questions ?? []), ...(context?.hints ?? [])];
  if (already.length === 0) return '';
  return `\n\nAlready raised earlier in this session — do not repeat these:\n- ${already.join('\n- ')}`;
}

export function buildFollowUpPrompt(description) {
  if (description.components.length === 0) {
    return (
      `${INTERVIEWER_PREAMBLE}\n\nThe candidate has not drawn anything yet. ` +
      'Return an empty questions array.'
    );
  }
  return (
    `${INTERVIEWER_PREAMBLE}\n\n${describeContext(description)}\n\n` +
    'Identify what this design has not addressed yet — for example scaling, failure ' +
    'handling, data consistency, or security. If nothing important is missing, return ' +
    'an empty array. Ask at most 4 questions, each one sentence.'
  );
}

export function buildHintPrompt(description, context) {
  return (
    `${INTERVIEWER_PREAMBLE}\n\n${describeContext(description)}${describeSessionSoFar(context)}\n\n` +
    'Give the candidate one short, specific hint that would help them improve the ' +
    'design. Do not give away a full solution.'
  );
}

export function buildFeedbackPrompt(description, context) {
  return (
    `${INTERVIEWER_PREAMBLE}\n\n${describeContext(description)}${describeSessionSoFar(context)}\n\n` +
    'The candidate is done and wants final feedback. Give a score from 0-100, a list ' +
    'of specific strengths, and a list of specific weaknesses. Reference the actual ' +
    'components drawn rather than speaking generically.'
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

export async function requestFollowUpQuestions(description) {
  const parsed = await generateJson(buildFollowUpPrompt(description), FOLLOW_UP_SCHEMA);
  return Array.isArray(parsed.questions) ? parsed.questions : [];
}

export async function requestHint(description, context) {
  const parsed = await generateJson(buildHintPrompt(description, context), HINT_SCHEMA);
  return typeof parsed.hint === 'string' ? parsed.hint : '';
}

export async function requestFeedback(description, context) {
  const parsed = await generateJson(buildFeedbackPrompt(description, context), FEEDBACK_SCHEMA);
  return {
    score: typeof parsed.score === 'number' ? parsed.score : null,
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
  };
}
