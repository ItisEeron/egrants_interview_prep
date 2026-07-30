import { NavLink } from 'react-router-dom';
import { useCurriculum } from '../../hooks/useCurriculum.js';
import { AccountFooter } from '../auth/AccountFooter.jsx';
import styles from './Sidebar.module.css';

function linkClass({ isActive }) {
  return isActive ? `${styles.link} ${styles.active}` : styles.link;
}

export function Sidebar() {
  const { curriculum } = useCurriculum();

  return (
    <nav className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandTitle}>Interview Prep</span>
        <span className={styles.brandSubtitle}>Senior Engineer</span>
      </div>

      <NavLink to="/" end className={linkClass}>
        Dashboard
      </NavLink>

      <div className={styles.sectionLabel}>Weeks</div>
      {curriculum?.weeks.map((week) => (
        <NavLink key={week.id} to={`/weeks/${week.id}`} className={linkClass}>
          <span className={styles.weekNumber}>{week.number}</span>
          {week.title}
        </NavLink>
      ))}

      <div className={styles.sectionLabel}>System Design</div>
      {curriculum?.designChapters.map((chapter) => (
        <NavLink key={chapter.id} to={`/design/${chapter.id}`} className={linkClass}>
          <span className={styles.weekNumber}>{chapter.number}</span>
          {chapter.title.replace(/^Design (a |the )?/, '')}
        </NavLink>
      ))}

      <AccountFooter />
    </nav>
  );
}
