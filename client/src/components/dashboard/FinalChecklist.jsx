import { Card } from '../common/Card.jsx';
import { Checklist } from '../common/Checklist.jsx';
import { useCurriculum } from '../../hooks/useCurriculum.js';
import { useProgress } from '../../hooks/useProgress.js';

export function FinalChecklist() {
  const { curriculum } = useCurriculum();
  const { progress, updateFinalChecklist } = useProgress();

  const items = curriculum?.checklists.finalInterview ?? [];

  return (
    <Card title="Final interview checklist">
      <Checklist
        items={items}
        checkedMap={progress?.finalChecklist ?? {}}
        onToggle={updateFinalChecklist}
      />
    </Card>
  );
}
