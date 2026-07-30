import { useEffect, useState } from 'react';
import styles from './FrameworkStep.module.css';

export function FrameworkStep({ step, notes, onSaveNotes }) {
  const [draft, setDraft] = useState(notes);

  useEffect(() => {
    setDraft(notes);
  }, [notes]);

  return (
    <li className={styles.step}>
      <div className={styles.heading}>
        <span className={styles.number}>{step.order}</span>
        <div>
          <h3 className={styles.title}>{step.title}</h3>
          <p className={styles.prompt}>{step.prompt}</p>
        </div>
      </div>
      <textarea
        className={styles.textarea}
        rows={4}
        value={draft}
        placeholder="Your notes…"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (draft !== notes) onSaveNotes(draft);
        }}
      />
    </li>
  );
}
