import { Badge } from '../common/Badge.jsx';
import styles from './ConceptList.module.css';

export function ConceptList({ concepts }) {
  return (
    <div className={styles.row}>
      {concepts.map((concept) => (
        <Badge key={concept}>{concept}</Badge>
      ))}
    </div>
  );
}

export function FollowUpQuestions({ questions }) {
  return (
    <ul className={styles.questions}>
      {questions.map((question) => (
        <li key={question}>{question}</li>
      ))}
    </ul>
  );
}
