import { ProblemRow } from './ProblemRow.jsx';
import styles from './ProblemTable.module.css';

export function ProblemTable({ problems }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.narrow}>#</th>
            <th>Problem</th>
            <th className={styles.narrow}>Priority</th>
            <th className={styles.narrow}>Solved</th>
            <th className={styles.narrow}>Reviewed</th>
            <th className={styles.narrow}>Confidence</th>
            <th className={styles.narrow}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((problem) => (
            <ProblemRow key={problem.id} problem={problem} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
