import { useEffect, useState } from 'react';
import { useDesign } from '../../hooks/useDesign.js';
import styles from './DesignNotes.module.css';

/**
 * The reasoning that goes with the diagram: assumptions, capacity estimates,
 * tradeoffs, and the bottlenecks you would name out loud.
 *
 * A diagram records what you decided; this records why, which is the half an
 * interviewer actually asks about — and the half that makes the graph
 * interpretable to anything reading it later.
 *
 * Kept in local state while typing and saved on blur, matching the notes
 * fields elsewhere in the app.
 */
const PLACEHOLDER = `Assumptions — users, QPS, read/write ratio, payload size
Capacity — storage per year, bandwidth, cache size
Tradeoffs — what you chose against, and why
Bottlenecks — what breaks first at 10x`;

export function DesignNotes() {
  const { design, updateNotes } = useDesign();
  const [draft, setDraft] = useState(design.notes);

  useEffect(() => {
    setDraft(design.notes);
  }, [design.notes]);

  return (
    <textarea
      className={styles.textarea}
      rows={10}
      value={draft}
      placeholder={PLACEHOLDER}
      aria-label="Design thinking and assumptions"
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        if (draft !== design.notes) updateNotes(draft);
      }}
    />
  );
}
