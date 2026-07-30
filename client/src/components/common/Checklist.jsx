import { Checkbox } from './Checkbox.jsx';
import styles from './Checklist.module.css';

/**
 * Presentational only — it renders items and reports clicks. Each section wires
 * it to the right slice of progress state.
 */
export function Checklist({ items, checkedMap, onToggle }) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.id}>
          <Checkbox
            label={item.label}
            checked={Boolean(checkedMap[item.id])}
            onChange={(checked) => onToggle(item.id, checked)}
          />
        </li>
      ))}
    </ul>
  );
}
