import { FrameworkStep } from './FrameworkStep.jsx';
import styles from './FrameworkStepList.module.css';

export function FrameworkStepList({ steps, stepNotes, onSaveNotes }) {
  return (
    <ol className={styles.list}>
      {steps.map((step) => (
        <FrameworkStep
          key={step.id}
          step={step}
          notes={stepNotes[step.id] ?? ''}
          onSaveNotes={(notes) => onSaveNotes(step.id, notes)}
        />
      ))}
    </ol>
  );
}
