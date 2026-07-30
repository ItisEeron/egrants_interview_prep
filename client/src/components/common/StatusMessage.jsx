import styles from './StatusMessage.module.css';

export function LoadingMessage({ children = 'Loading…' }) {
  return <p className={styles.muted}>{children}</p>;
}

export function ErrorMessage({ error }) {
  return <p className={styles.error}>{error?.message ?? 'Something went wrong.'}</p>;
}
