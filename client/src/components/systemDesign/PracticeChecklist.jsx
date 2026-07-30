import { Card } from '../common/Card.jsx';
import { Checklist } from '../common/Checklist.jsx';
import { useCurriculum } from '../../hooks/useCurriculum.js';
import { useChapterProgress, useProgress } from '../../hooks/useProgress.js';

export function PracticeChecklist({ chapterId }) {
  const { curriculum } = useCurriculum();
  const { updateChapterChecklist } = useProgress();
  const chapterProgress = useChapterProgress(chapterId);

  const items = curriculum?.designFramework.practiceChecklist ?? [];

  return (
    <Card title="Practice checklist">
      <Checklist
        items={items}
        checkedMap={chapterProgress.checklist}
        onToggle={(itemId, checked) => updateChapterChecklist(chapterId, itemId, checked)}
      />
    </Card>
  );
}
