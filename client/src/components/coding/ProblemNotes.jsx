import { useEffect, useState } from 'react';
import styles from './ProblemNotes.module.css';

/**
 * Notes are kept in local state while typing and saved when the field loses
 * focus, so every keystroke does not become a network request.
 */
export function ProblemNotes({ value, onSave, placeholder }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <textarea
      className={styles.textarea}
      value={draft}
      placeholder={placeholder}
      rows={2}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        if (draft !== value) onSave(draft);
      }}
    />
  );
}
