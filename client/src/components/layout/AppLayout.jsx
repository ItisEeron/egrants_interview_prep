import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const { saveError } = useProgress();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={() => setSidebarOpen((open) => !open)}
        aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={sidebarOpen}
      >
        <span className={styles.menuIcon} />
      </button>

      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      <Sidebar isOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} onClose={() => setSidebarOpen(false)} />

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
