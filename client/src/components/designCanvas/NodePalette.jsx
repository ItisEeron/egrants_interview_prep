import { COMPONENT_KINDS } from '../../constants/designNodes.js';
import styles from './NodePalette.module.css';

/**
 * The row of buttons that add a component to the canvas.
 *
 * This component only renders the catalog and reports which button was pressed.
 * Where the new node lands is the canvas's business, since only the canvas
 * knows where the viewport is currently looking.
 */
export function NodePalette({ onAddComponent }) {
  return (
    <div className={styles.palette}>
      {COMPONENT_KINDS.map((entry) => (
        <button
          key={entry.kind}
          type="button"
          className={styles.button}
          style={{ '--kind-color': entry.color }}
          title={entry.hint}
          onClick={() => onAddComponent(entry.kind)}
        >
          <span className={styles.dot} aria-hidden="true" />
          {entry.label}
        </button>
      ))}
    </div>
  );
}
