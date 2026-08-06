import { Card } from '../common/Card.jsx';
import styles from './ConceptNote.module.css';

export function ConceptNote({ note }) {
  return (
    <Card title={note.title}>
      <p className={styles.summary}>{note.summary}</p>
      {note.whenToUse ? (
        <>
          <h3 className={styles.subheading}>When to reach for it</h3>
          <ul className={styles.list}>
            {note.whenToUse.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}
      {note.coreOperations ? (
        <>
          <h3 className={styles.subheading}>Core operations</h3>
          <ul className={styles.list}>
            {note.coreOperations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}
      {note.complexity ? <p className={styles.summary}>{note.complexity}</p> : null}
    </Card>
  );
}
