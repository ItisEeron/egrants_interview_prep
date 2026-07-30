import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const { saveError } = useProgress();

  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.main}>
        {saveError && (
          <p className={styles.saveError}>
            Could not save your last change ({saveError.message}). It is still on screen and will be
            retried with your next edit.
          </p>
        )}
        <Outlet />
      </main>
    </div>
  );
}
