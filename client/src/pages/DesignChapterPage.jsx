import { Link, useParams } from 'react-router-dom';
import { Card } from '../components/common/Card.jsx';
import { ErrorMessage, LoadingMessage } from '../components/common/StatusMessage.jsx';
import { DesignSection } from '../components/designCanvas/DesignSection.jsx';
import { ConceptList, FollowUpQuestions } from '../components/systemDesign/ConceptList.jsx';
import { FrameworkStepList } from '../components/systemDesign/FrameworkStepList.jsx';
import { PracticeChecklist } from '../components/systemDesign/PracticeChecklist.jsx';
import { useDesignChapter } from '../hooks/useCurriculum.js';
import { useChapterProgress, useProgress } from '../hooks/useProgress.js';
import styles from './DesignChapterPage.module.css';

export function DesignChapterPage() {
  const { chapterId } = useParams();
  const { chapter, framework, isLoading, error } = useDesignChapter(chapterId);
  const { updateChapterStepNotes, isLoading: progressLoading, error: progressError } = useProgress();
  const chapterProgress = useChapterProgress(chapterId);

  if (error || progressError) return <ErrorMessage error={error || progressError} />;
  if (isLoading || progressLoading) return <LoadingMessage />;
  if (!chapter) return <ErrorMessage error={new Error('Chapter not found')} />;

  return (
    <div className={styles.page}>
      <header>
        <span className={styles.eyebrow}>
          Chapter {chapter.number} ·{' '}
          <Link to={`/weeks/${chapter.weekId}`} className={styles.weekLink}>
            Week {chapter.weekId.replace('week-', '')}
          </Link>
        </span>
        <h1 className={styles.heading}>{chapter.title}</h1>
      </header>

      <Card title="Core concepts">
        <ConceptList concepts={chapter.coreConcepts} />
      </Card>

      <Card title="Interview framework">
        <FrameworkStepList
          steps={framework.steps}
          stepNotes={chapterProgress.stepNotes}
          onSaveNotes={(stepId, notes) => updateChapterStepNotes(chapter.id, stepId, notes)}
        />
      </Card>

      <DesignSection chapter={chapter} />

      <Card title="Common follow-up questions">
        <FollowUpQuestions questions={chapter.followUpQuestions} />
      </Card>

      <PracticeChecklist chapterId={chapter.id} />
    </div>
  );
}
