import styles from './EdgeInspector.module.css';

/**
 * Labels the selected connection.
 *
 * Appears only when exactly one connection is selected; selection state lives
 * on the edges themselves, so this needs no state of its own.
 */
export function EdgeInspector({ edge, onLabelChange }) {
  return (
    <div className={styles.inspector}>
      <label className={styles.label} htmlFor="edge-label">
        Connection
      </label>
      <input
        id="edge-label"
        className={styles.input}
        value={edge.label ?? ''}
        placeholder="reads from, writes to, async via Kafka…"
        onChange={(event) => onLabelChange(edge.id, event.target.value)}
      />
    </div>
  );
}
