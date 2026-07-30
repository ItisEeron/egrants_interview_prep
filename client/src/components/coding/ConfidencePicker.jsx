import { CONFIDENCE_OPTIONS } from '../../constants/progress.js';
import styles from './ConfidencePicker.module.css';

export function ConfidencePicker({ value, onChange }) {
  return (
    <div className={styles.group} role="group" aria-label="Confidence">
      {CONFIDENCE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          title={option.label}
          aria-label={option.label}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`${styles.dot} ${styles[option.tone]} ${value === option.value ? styles.selected : ''}`}
        >
          {option.symbol}
        </button>
      ))}
    </div>
  );
}
