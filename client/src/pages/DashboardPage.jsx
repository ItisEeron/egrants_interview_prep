import { OverallStats } from '../components/dashboard/OverallStats.jsx';
import { FinalChecklist } from '../components/dashboard/FinalChecklist.jsx';
import { WeekCard } from '../components/dashboard/WeekCard.jsx';
import { ErrorMessage, LoadingMessage } from '../components/common/StatusMessage.jsx';
import { useCurriculum } from '../hooks/useCurriculum.js';
import { useProgress } from '../hooks/useProgress.js';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const { curriculum, isLoading: curriculumLoading, error: curriculumError } = useCurriculum();
  const { progress, isLoading: progressLoading, error: progressError } = useProgress();

  const error = curriculumError || progressError;
  if (error) return <ErrorMessage error={error} />;
  if (curriculumLoading || progressLoading || !curriculum || !progress) return <LoadingMessage />;

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.heading}>Senior Engineer preparation</h1>
        <p className={styles.subheading}>
          Four weeks of coding problems and ten system design chapters, in workbook order.
        </p>
      </header>

      <OverallStats curriculum={curriculum} progress={progress} />

      <div className={styles.weekGrid}>
        {curriculum.weeks.map((week) => (
          <WeekCard
            key={week.id}
            week={week}
            chapters={curriculum.designChapters.filter((c) => c.weekId === week.id)}
          />
        ))}
      </div>

      <FinalChecklist />
    </div>
  );
}
