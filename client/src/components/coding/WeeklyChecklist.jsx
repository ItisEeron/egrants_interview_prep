import { Card } from '../common/Card.jsx';
import { Checklist } from '../common/Checklist.jsx';
import { useCurriculum } from '../../hooks/useCurriculum.js';
import { useProgress } from '../../hooks/useProgress.js';

export function WeeklyChecklist({ weekId }) {
  const { curriculum } = useCurriculum();
  const { progress, updateWeeklyChecklist } = useProgress();

  const items = curriculum?.checklists.weekly ?? [];
  const checkedMap = progress?.weeklyChecklists[weekId] ?? {};

  return (
    <Card title="Weekly checklist">
      <Checklist
        items={items}
        checkedMap={checkedMap}
        onToggle={(itemId, checked) => updateWeeklyChecklist(weekId, itemId, checked)}
      />
    </Card>
  );
}
