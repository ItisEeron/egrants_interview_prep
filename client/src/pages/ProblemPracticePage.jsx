import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DifficultyBadge } from '../components/common/Badge.jsx';
import { Card } from '../components/common/Card.jsx';
import { ErrorMessage, LoadingMessage } from '../components/common/StatusMessage.jsx';
import { CodeCritique } from '../components/coding/practice/CodeCritique.jsx';
import { CodeEditor } from '../components/coding/practice/CodeEditor.jsx';
import { CODE_LANGUAGES, boilerplateFor } from '../constants/codeBoilerplate.js';
import { useProblem } from '../hooks/useCurriculum.js';
import { useProblemProgress, useProgress } from '../hooks/useProgress.js';
import styles from './ProblemPracticePage.module.css';

function leetcodeUrl(problem) {
  return `https://leetcode.com/problems/${problem.slug}/`;
}

export function ProblemPracticePage() {
  const { weekId, problemId } = useParams();
  const { week, problem, isLoading, error } = useProblem(weekId, problemId);
  const { submissions } = useProblemProgress(problemId);
  const { updateProblemSubmission } = useProgress();

  const [language, setLanguage] = useState(CODE_LANGUAGES[0].id);
  const savedCode = submissions[language]?.code ?? boilerplateFor(language);
  const [code, setCode] = useState(savedCode);

  const codeRef = useRef(code);
  codeRef.current = code;
  const savedCodeRef = useRef(savedCode);
  savedCodeRef.current = savedCode;
  const languageRef = useRef(language);
  languageRef.current = language;

  useEffect(() => {
    setCode(savedCode);
  }, [savedCode]);

  // Monaco's language/value props change without unmounting, so switching
  // languages (or leaving the page) never fires a blur on its own — this is
  // the only thing that flushes an in-progress edit in either case.
  const flush = useCallback(() => {
    if (codeRef.current !== savedCodeRef.current) {
      updateProblemSubmission(problemId, languageRef.current, codeRef.current);
    }
  }, [problemId, updateProblemSubmission]);

  useEffect(() => flush, [flush]);

  if (error) return <ErrorMessage error={error} />;
  if (isLoading) return <LoadingMessage />;
  if (!problem) return <ErrorMessage error={new Error('Problem not found')} />;

  return (
    <div className={styles.page}>
      <header>
        <span className={styles.eyebrow}>
          <Link to={`/weeks/${week.id}`} className={styles.weekLink}>
            Week {week.id.replace('week-', '')}
          </Link>
        </span>
        <h1 className={styles.heading}>
          {problem.leetcodeId}. {problem.title}
        </h1>
        <div className={styles.meta}>
          <DifficultyBadge difficulty={problem.difficulty} />
          <span className={styles.pattern}>{problem.pattern}</span>
          <a href={leetcodeUrl(problem)} target="_blank" rel="noreferrer" className={styles.leetcodeLink}>
            View on LeetCode
          </a>
        </div>
      </header>

      <Card title="Your code">
        <CodeEditor
          language={language}
          onLanguageChange={(next) => {
            flush();
            setLanguage(next);
          }}
          value={code}
          onChange={setCode}
          onBlur={flush}
        />
      </Card>

      <Card title="AI critique">
        <CodeCritique problem={problem} language={language} code={code} />
      </Card>
    </div>
  );
}
