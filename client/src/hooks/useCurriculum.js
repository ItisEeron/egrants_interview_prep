import { useCurriculumContext } from '../context/CurriculumContext.jsx';

export function useCurriculum() {
  return useCurriculumContext();
}

export function useWeek(weekId) {
  const { curriculum, isLoading, error } = useCurriculumContext();
  const week = curriculum?.weeks.find((candidate) => candidate.id === weekId) ?? null;
  const chapters = curriculum?.designChapters.filter((c) => c.weekId === weekId) ?? [];
  return { week, chapters, isLoading, error };
}

export function useDesignChapter(chapterId) {
  const { curriculum, isLoading, error } = useCurriculumContext();
  const chapter = curriculum?.designChapters.find((c) => c.id === chapterId) ?? null;
  return { chapter, framework: curriculum?.designFramework ?? null, isLoading, error };
}
