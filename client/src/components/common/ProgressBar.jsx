import styles from './ProgressBar.module.css';

export function ProgressBar({ percent, tone = 'accent' }) {
  return (
    <div className={styles.track} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <div className={`${styles.fill} ${styles[tone]}`} style={{ width: `${percent}%` }} />
    </div>
  );
}
