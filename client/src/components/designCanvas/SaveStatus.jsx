import { useDesign } from '../../hooks/useDesign.js';
import styles from './SaveStatus.module.css';

/**
 * Says whether the diagram is stored.
 *
 * There is no save button — edits are written a moment after you stop — so
 * without this there is nothing telling you the work is safe to walk away from.
 */
export function SaveStatus() {
  const { isSaving, saveError } = useDesign();

  if (saveError) {
    return <span className={styles.error}>Not saved — {saveError.message}</span>;
  }

  return (
    <span className={isSaving ? styles.saving : styles.saved}>{isSaving ? 'Saving…' : 'Saved'}</span>
  );
}
