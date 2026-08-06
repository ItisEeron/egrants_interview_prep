import { Link, useParams } from 'react-router-dom';
import { Card } from '../components/common/Card.jsx';
import { ProgressBar } from '../components/common/ProgressBar.jsx';
import { ErrorMessage, LoadingMessage } from '../components/common/StatusMessage.jsx';
import { ConceptNote } from '../components/coding/ConceptNote.jsx';
import { ProblemTable } from '../components/coding/ProblemTable.jsx';
import { WeeklyChecklist } from '../components/coding/WeeklyChecklist.jsx';
import { useWeek } from '../hooks/useCurriculum.js';
import { useProgress } from '../hooks/useProgress.js';
import { useWeekStats } from '../hooks/useWeekStats.js';
import styles from './WeekPage.module.css';

export function WeekPage() {
  const { weekId } = useParams();
  const { week, chapters, isLoading, error } = useWeek(weekId);
  const { isLoading: progressLoading, error: progressError } = useProgress();
  const stats = useWeekStats(week);

  if (error || progressError) return <ErrorMessage error={error || progressError} />;
  if (isLoading || progressLoading) return <LoadingMessage />;
  if (!week) return <ErrorMessage error={new Error('Week not found')} />;

  return (
    <div className={styles.page}>
      <header>
        <span className={styles.eyebrow}>Week {week.number}</span>
        <h1 className={styles.heading}>{week.title}</h1>
        <p className={styles.summary}>{week.summary}</p>
        <div className={styles.progressRow}>
          <ProgressBar percent={stats.percent} tone={stats.percent === 100 ? 'success' : 'accent'} />
          <span className={styles.progressLabel}>
            {stats.solved} / {stats.total} solved
          </span>
        </div>
      </header>

      {(week.conceptNotes ?? []).map((note) => (
        <ConceptNote key={note.id} note={note} />
      ))}

      <Card title="Coding problems">
        <ProblemTable problems={week.problems} weekId={week.id} />
      </Card>

      <Card title="System design for this week">
        <ul className={styles.chapterList}>
          {chapters.map((chapter) => (
            <li key={chapter.id}>
              <Link to={`/design/${chapter.id}`} className={styles.chapterLink}>
                <span className={styles.chapterNumber}>{chapter.number}</span>
                <span>
                  <span className={styles.chapterTitle}>{chapter.title}</span>
                  <span className={styles.chapterConcepts}>{chapter.coreConcepts.join(' · ')}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <WeeklyChecklist weekId={week.id} />
    </div>
  );
}
