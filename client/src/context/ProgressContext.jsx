import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { progressApi } from '../api/progressApi.js';
import { EMPTY_CHAPTER_PROGRESS, EMPTY_PROBLEM_PROGRESS } from '../constants/progress.js';

/**
 * Holds everything the user has recorded: solved/reviewed flags, confidence,
 * notes, and checklist state.
 *
 * Every update is applied to local state first so the UI stays responsive, then
 * sent to the server. A failed request rolls the change back.
 */
const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    progressApi.fetchProgress().then(setProgress).catch(setError);
  }, []);

  const applyOptimistic = useCallback(async (produceNextState, sendRequest) => {
    let rollback;
    setProgress((current) => {
      rollback = current;
      return produceNextState(current);
    });

    try {
      await sendRequest();
      setError(null);
    } catch (requestError) {
      setProgress(rollback);
      setError(requestError);
    }
  }, []);

  const updateProblem = useCallback(
    (problemId, changes) =>
      applyOptimistic(
        (current) => ({
          ...current,
          problems: {
            ...current.problems,
            [problemId]: {
              ...EMPTY_PROBLEM_PROGRESS,
              ...current.problems[problemId],
              ...changes,
            },
          },
        }),
        () => progressApi.updateProblem(problemId, changes),
      ),
    [applyOptimistic],
  );

  const updateChapterStepNotes = useCallback(
    (chapterId, stepId, notes) =>
      applyOptimistic(
        (current) => {
          const chapter = current.designChapters[chapterId] ?? EMPTY_CHAPTER_PROGRESS;
          return {
            ...current,
            designChapters: {
              ...current.designChapters,
              [chapterId]: { ...chapter, stepNotes: { ...chapter.stepNotes, [stepId]: notes } },
            },
          };
        },
        () => progressApi.updateChapterStepNotes(chapterId, stepId, notes),
      ),
    [applyOptimistic],
  );

  const updateChapterChecklist = useCallback(
    (chapterId, itemId, checked) =>
      applyOptimistic(
        (current) => {
          const chapter = current.designChapters[chapterId] ?? EMPTY_CHAPTER_PROGRESS;
          return {
            ...current,
            designChapters: {
              ...current.designChapters,
              [chapterId]: { ...chapter, checklist: { ...chapter.checklist, [itemId]: checked } },
            },
          };
        },
        () => progressApi.updateChapterChecklist(chapterId, itemId, checked),
      ),
    [applyOptimistic],
  );

  const updateWeeklyChecklist = useCallback(
    (weekId, itemId, checked) =>
      applyOptimistic(
        (current) => ({
          ...current,
          weeklyChecklists: {
            ...current.weeklyChecklists,
            [weekId]: { ...(current.weeklyChecklists[weekId] ?? {}), [itemId]: checked },
          },
        }),
        () => progressApi.updateWeeklyChecklist(weekId, itemId, checked),
      ),
    [applyOptimistic],
  );

  const updateFinalChecklist = useCallback(
    (itemId, checked) =>
      applyOptimistic(
        (current) => ({
          ...current,
          finalChecklist: { ...current.finalChecklist, [itemId]: checked },
        }),
        () => progressApi.updateFinalChecklist(itemId, checked),
      ),
    [applyOptimistic],
  );

  const value = {
    progress,
    error,
    isLoading: !progress && !error,
    updateProblem,
    updateChapterStepNotes,
    updateChapterChecklist,
    updateWeeklyChecklist,
    updateFinalChecklist,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgressContext() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgressContext must be used inside <ProgressProvider>');
  return context;
}
