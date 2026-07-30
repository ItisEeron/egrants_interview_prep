import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createProgressStore, loadProgress } from '../storage/index.js';
import { useAuth } from './AuthContext.jsx';
import { EMPTY_CHAPTER_PROGRESS, EMPTY_PROBLEM_PROGRESS } from '../constants/progress.js';

/**
 * Holds everything the user has recorded: solved/reviewed flags, confidence,
 * notes, and checklist state.
 *
 * There is no server, so the next state is computed here and the whole document
 * is handed to the store. The document is a few kilobytes, which makes writing
 * all of it cheaper than the bookkeeping needed to write part of it.
 *
 * Updates apply locally first so the UI never waits on the network. A failed
 * write surfaces as `saveError` but does not roll the change back: the store
 * holds one document, so rolling back would discard every edit made since the
 * last successful write, including whatever the user just typed. The change
 * stays on screen and the next edit retries the whole document.
 */
const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const { user } = useAuth();
  const store = useMemo(() => createProgressStore(user), [user]);

  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  // Mirrors `progress` so an update can read the current document without
  // waiting for a re-render, and so two edits in one tick cannot clobber.
  const progressRef = useRef(null);
  // The document waiting to be written, and whether a write is in flight.
  // Together they serialise writes: a burst of clicks collapses into one write
  // of the latest document rather than a race between overlapping requests.
  const pendingRef = useRef(null);
  const isWritingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    progressRef.current = null;
    setProgress(null);
    setError(null);

    loadProgress(store)
      .then((document) => {
        if (cancelled) return;
        progressRef.current = document;
        setProgress(document);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError);
      });

    return () => {
      cancelled = true;
    };
  }, [store]);

  const persist = useCallback(
    async (document) => {
      pendingRef.current = document;
      if (isWritingRef.current) return;

      isWritingRef.current = true;
      try {
        while (pendingRef.current) {
          const next = pendingRef.current;
          pendingRef.current = null;
          await store.write(next);
        }
        setSaveError(null);
      } catch (writeError) {
        pendingRef.current = null;
        setSaveError(writeError);
      } finally {
        isWritingRef.current = false;
      }
    },
    [store],
  );

  const applyChange = useCallback(
    (produceNextState) => {
      const current = progressRef.current;
      if (!current) return;

      const next = produceNextState(current);
      progressRef.current = next;
      setProgress(next);
      persist(next);
    },
    [persist],
  );

  const updateProblem = useCallback(
    (problemId, changes) =>
      applyChange((current) => ({
        ...current,
        problems: {
          ...current.problems,
          [problemId]: {
            ...EMPTY_PROBLEM_PROGRESS,
            ...current.problems[problemId],
            ...changes,
          },
        },
      })),
    [applyChange],
  );

  const updateChapterStepNotes = useCallback(
    (chapterId, stepId, notes) =>
      applyChange((current) => {
        const chapter = current.designChapters[chapterId] ?? EMPTY_CHAPTER_PROGRESS;
        return {
          ...current,
          designChapters: {
            ...current.designChapters,
            [chapterId]: { ...chapter, stepNotes: { ...chapter.stepNotes, [stepId]: notes } },
          },
        };
      }),
    [applyChange],
  );

  const updateChapterChecklist = useCallback(
    (chapterId, itemId, checked) =>
      applyChange((current) => {
        const chapter = current.designChapters[chapterId] ?? EMPTY_CHAPTER_PROGRESS;
        return {
          ...current,
          designChapters: {
            ...current.designChapters,
            [chapterId]: { ...chapter, checklist: { ...chapter.checklist, [itemId]: checked } },
          },
        };
      }),
    [applyChange],
  );

  const updateWeeklyChecklist = useCallback(
    (weekId, itemId, checked) =>
      applyChange((current) => ({
        ...current,
        weeklyChecklists: {
          ...current.weeklyChecklists,
          [weekId]: { ...(current.weeklyChecklists[weekId] ?? {}), [itemId]: checked },
        },
      })),
    [applyChange],
  );

  const updateFinalChecklist = useCallback(
    (itemId, checked) =>
      applyChange((current) => ({
        ...current,
        finalChecklist: { ...current.finalChecklist, [itemId]: checked },
      })),
    [applyChange],
  );

  const value = {
    progress,
    error,
    saveError,
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
