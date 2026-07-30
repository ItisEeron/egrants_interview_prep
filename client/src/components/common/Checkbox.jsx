import styles from './Checkbox.module.css';

export function Checkbox({ checked, onChange, label, compact = false }) {
  return (
    <label className={compact ? styles.compact : styles.root}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label ? <span>{label}</span> : null}
    </label>
  );
}
