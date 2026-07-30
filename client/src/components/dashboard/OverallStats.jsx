import { ProgressBar } from '../common/ProgressBar.jsx';
import { EMPTY_PROBLEM_PROGRESS } from '../../constants/progress.js';
import styles from './OverallStats.module.css';

export function OverallStats({ curriculum, progress }) {
  const problems = curriculum.weeks.flatMap((week) => week.problems);
  const solved = problems.filter(
    (problem) => (progress.problems[problem.id] ?? EMPTY_PROBLEM_PROGRESS).solved,
  ).length;

  const shaky = problems.filter((problem) => {
    const record = progress.problems[problem.id] ?? EMPTY_PROBLEM_PROGRESS;
    return record.solved && record.confidence === 'low';
  }).length;

  const chaptersStarted = curriculum.designChapters.filter((chapter) => {
    const record = progress.designChapters[chapter.id];
    return record && Object.values(record.stepNotes ?? {}).some((note) => note.trim());
  }).length;

  const percent = Math.round((solved / problems.length) * 100);

  return (
    <div className={styles.panel}>
      <div className={styles.headline}>
        <span className={styles.big}>{percent}%</span>
        <span className={styles.caption}>
          {solved} of {problems.length} coding problems solved
        </span>
      </div>
      <ProgressBar percent={percent} />
      <div className={styles.tiles}>
        <div>
          <span className={styles.tileValue}>{shaky}</span>
          <span className={styles.tileLabel}>Solved but shaky</span>
        </div>
        <div>
          <span className={styles.tileValue}>
            {chaptersStarted} / {curriculum.designChapters.length}
          </span>
          <span className={styles.tileLabel}>Design chapters started</span>
        </div>
      </div>
    </div>
  );
}
