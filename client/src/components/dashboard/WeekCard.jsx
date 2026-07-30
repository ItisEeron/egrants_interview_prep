import { Link } from 'react-router-dom';
import { ProgressBar } from '../common/ProgressBar.jsx';
import { useWeekStats } from '../../hooks/useWeekStats.js';
import styles from './WeekCard.module.css';

export function WeekCard({ week, chapters }) {
  const stats = useWeekStats(week);

  return (
    <Link to={`/weeks/${week.id}`} className={styles.card}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>Week {week.number}</span>
        <span className={styles.percent}>{stats.percent}%</span>
      </div>
      <h3 className={styles.title}>{week.title}</h3>
      <ProgressBar percent={stats.percent} tone={stats.percent === 100 ? 'success' : 'accent'} />
      <dl className={styles.stats}>
        <div>
          <dt>Solved</dt>
          <dd>
            {stats.solved} / {stats.total}
          </dd>
        </div>
        <div>
          <dt>Must solve</dt>
          <dd>
            {stats.mustSolveDone} / {stats.mustSolve}
          </dd>
        </div>
        <div>
          <dt>Design</dt>
          <dd>{chapters.length} chapters</dd>
        </div>
      </dl>
    </Link>
  );
}
