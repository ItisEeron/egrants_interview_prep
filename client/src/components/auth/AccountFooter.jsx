import { useAuth } from '../../context/AuthContext.jsx';
import styles from './AccountFooter.module.css';

/**
 * Shows which account the progress is being saved to, and the way out.
 * Renders nothing in local mode, where there is no account.
 */
export function AccountFooter() {
  const { isEnabled, user, signOut } = useAuth();

  if (!isEnabled || !user) return null;

  return (
    <div className={styles.footer}>
      <span className={styles.email} title={user.email}>
        {user.email}
      </span>
      <button type="button" className={styles.signOut} onClick={signOut}>
        Sign out
      </button>
    </div>
  );
}
