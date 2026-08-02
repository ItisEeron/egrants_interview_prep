import { useProgressContext } from '../context/ProgressContext.jsx';
import { EMPTY_CHAPTER_PROGRESS, EMPTY_PROBLEM_PROGRESS } from '../constants/progress.js';

export function useProgress() {
  return useProgressContext();
}

export function useProblemProgress(problemId) {
  const { progress } = useProgressContext();
  // Spread rather than `??`: a record can exist (e.g. seeded before a field
  // like `submissions` was added) without carrying every current field, and
  // callers should never have to guard against that themselves.
  return { ...EMPTY_PROBLEM_PROGRESS, ...progress?.problems[problemId] };
}

export function useChapterProgress(chapterId) {
  const { progress } = useProgressContext();
  return progress?.designChapters[chapterId] ?? EMPTY_CHAPTER_PROGRESS;
}
