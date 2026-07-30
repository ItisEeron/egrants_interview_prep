import { useAuth } from '../../context/AuthContext.jsx';
import styles from './SignInPage.module.css';

export function SignInPage() {
  const { signIn, error } = useAuth();

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <h1 className={styles.title}>Interview Prep</h1>
        <p className={styles.subtitle}>Senior Engineer</p>
        <p className={styles.blurb}>
          Sign in to load your progress. It is stored against your Google account, so it follows you
          between devices.
        </p>

        <button type="button" className={styles.button} onClick={signIn}>
          Continue with Google
        </button>

        {error && <p className={styles.error}>{error.message}</p>}
      </div>
    </div>
  );
}
