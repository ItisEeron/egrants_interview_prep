import styles from './Badge.module.css';

export function Badge({ children, tone = 'neutral', title }) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`} title={title}>
      {children}
    </span>
  );
}

const DIFFICULTY_TONES = { Easy: 'success', Medium: 'warning', Hard: 'danger' };

export function DifficultyBadge({ difficulty }) {
  return <Badge tone={DIFFICULTY_TONES[difficulty] ?? 'neutral'}>{difficulty}</Badge>;
}
