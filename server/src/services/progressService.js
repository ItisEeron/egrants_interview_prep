import { getStorageAdapter } from '../storage/index.js';
import { EMPTY_DOCUMENT } from '../storage/StorageAdapter.js';

const CONFIDENCE_LEVELS = ['none', 'low', 'medium', 'high'];

const DEFAULT_PROBLEM = { solved: false, reviewed: false, confidence: 'none', notes: '' };
const DEFAULT_CHAPTER = { stepNotes: {}, checklist: {} };

function storage() {
  return getStorageAdapter();
}

export async function getProgress() {
  return storage().read();
}

export async function updateProblem(problemId, changes) {
  const document = await storage().read();
  const current = document.problems[problemId] ?? DEFAULT_PROBLEM;

  const next = { ...current };
  if ('solved' in changes) next.solved = Boolean(changes.solved);
  if ('reviewed' in changes) next.reviewed = Boolean(changes.reviewed);
  if ('notes' in changes) next.notes = String(changes.notes);
  if ('confidence' in changes) {
    if (!CONFIDENCE_LEVELS.includes(changes.confidence)) {
      throw Object.assign(new Error(`confidence must be one of: ${CONFIDENCE_LEVELS.join(', ')}`), {
        status: 400,
      });
    }
    next.confidence = changes.confidence;
  }

  document.problems[problemId] = next;
  await storage().write(document);
  return next;
}

export async function updateDesignChapter(chapterId, changes) {
  const document = await storage().read();
  const current = document.designChapters[chapterId] ?? DEFAULT_CHAPTER;

  const next = {
    stepNotes: { ...current.stepNotes },
    checklist: { ...current.checklist },
  };

  if (changes.stepId !== undefined) {
    next.stepNotes[changes.stepId] = String(changes.notes ?? '');
  }
  if (changes.checklistItemId !== undefined) {
    next.checklist[changes.checklistItemId] = Boolean(changes.checked);
  }

  document.designChapters[chapterId] = next;
  await storage().write(document);
  return next;
}

export async function updateWeeklyChecklist(weekId, itemId, checked) {
  const document = await storage().read();
  const week = { ...(document.weeklyChecklists[weekId] ?? {}), [itemId]: Boolean(checked) };
  document.weeklyChecklists[weekId] = week;
  await storage().write(document);
  return week;
}

export async function updateFinalChecklist(itemId, checked) {
  const document = await storage().read();
  document.finalChecklist[itemId] = Boolean(checked);
  await storage().write(document);
  return document.finalChecklist;
}

export async function resetProgress() {
  return storage().write(structuredClone(EMPTY_DOCUMENT));
}
