import { useProgressContext } from '../context/ProgressContext.jsx';
import { EMPTY_PROBLEM_PROGRESS } from '../constants/progress.js';

/**
 * Counts for a single week, used by both the dashboard cards and the week page.
 */
export function useWeekStats(week) {
  const { progress } = useProgressContext();

  if (!week || !progress) {
    return { total: 0, solved: 0, reviewed: 0, mustSolve: 0, mustSolveDone: 0, percent: 0 };
  }

  const records = week.problems.map(
    (problem) => progress.problems[problem.id] ?? EMPTY_PROBLEM_PROGRESS,
  );

  const solved = records.filter((record) => record.solved).length;
  const reviewed = records.filter((record) => record.reviewed).length;
  const mustSolveProblems = week.problems.filter((problem) => problem.mustSolve);
  const mustSolveDone = mustSolveProblems.filter(
    (problem) => (progress.problems[problem.id] ?? EMPTY_PROBLEM_PROGRESS).solved,
  ).length;

  return {
    total: week.problems.length,
    solved,
    reviewed,
    mustSolve: mustSolveProblems.length,
    mustSolveDone,
    percent: week.problems.length ? Math.round((solved / week.problems.length) * 100) : 0,
  };
}
