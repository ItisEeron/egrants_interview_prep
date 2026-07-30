import { useProgressContext } from '../context/ProgressContext.jsx';
import { EMPTY_CHAPTER_PROGRESS, EMPTY_PROBLEM_PROGRESS } from '../constants/progress.js';

export function useProgress() {
  return useProgressContext();
}

export function useProblemProgress(problemId) {
  const { progress } = useProgressContext();
  return progress?.problems[problemId] ?? EMPTY_PROBLEM_PROGRESS;
}

export function useChapterProgress(chapterId) {
  const { progress } = useProgressContext();
  return progress?.designChapters[chapterId] ?? EMPTY_CHAPTER_PROGRESS;
}
