import { useState } from 'react';
import { requestFeedback, requestFollowUpQuestions, requestHint } from '../../../ai/codeCritique.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useAiAction } from '../../../hooks/useAiAction.js';
import styles from './CodeCritique.module.css';

/**
 * An optional AI critique of the code, on request only — the coding-problem
 * counterpart of `designCanvas/AIAnalysis.jsx`. Same three actions, same
 * shared rate limit (`useAiAction`), same reasoning for keeping feedback
 * separate from analyze/hint: a final score is something you ask for once
 * you're done, not a side effect of getting a hint mid-attempt.
 */
export function CodeCritique({ problem, language, code }) {
  const { isEnabled, user, signIn } = useAuth();
  const [questions, setQuestions] = useState(null);
  const [hints, setHints] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const { run, pending, errorMessage, usage, limit } = useAiAction();

  if (!isEnabled) {
    return <p className={styles.muted}>AI critique needs Firebase configured for this project.</p>;
  }

  if (!user) {
    return (
      <div className={styles.signedOut}>
        <p className={styles.muted}>Sign in to get an AI critique of your code.</p>
        <button type="button" className={styles.secondaryButton} onClick={signIn}>
          Continue with Google
        </button>
      </div>
    );
  }

  const sessionContext = { questions: questions ?? [], hints };
  const submission = { problem, language, code };

  const handleAnalyze = () =>
    run('analyze', async () => {
      setQuestions(await requestFollowUpQuestions(submission));
    });

  const handleHint = () =>
    run('hint', async () => {
      const hint = await requestHint(submission, sessionContext);
      setHints((prev) => [...prev, hint]);
    });

  const handleFeedback = () =>
    run('feedback', async () => {
      setFeedback(await requestFeedback(submission, sessionContext));
    });

  const isBusy = pending !== null || usage?.remaining === 0;

  return (
    <div className={styles.panel}>
      <div className={styles.actions}>
        <button type="button" className={styles.primaryButton} disabled={isBusy} onClick={handleAnalyze}>
          {pending === 'analyze' ? 'Analyzing…' : 'Analyze my code'}
        </button>
        <button type="button" className={styles.secondaryButton} disabled={isBusy} onClick={handleHint}>
          {pending === 'hint' ? 'Thinking…' : 'Get a hint'}
        </button>
      </div>

      {usage && (
        <p className={styles.muted}>
          {usage.count}/{limit} AI calls used today
        </p>
      )}

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      {questions && (
        <div className={styles.result}>
          <h3 className={styles.resultTitle}>Follow-up questions</h3>
          {questions.length === 0 ? (
            <p className={styles.muted}>Nothing obviously missing.</p>
          ) : (
            <ul className={styles.list}>
              {questions.map((question, index) => (
                <li key={`${index}-${question}`}>{question}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {hints.length > 0 && (
        <div className={styles.result}>
          <h3 className={styles.resultTitle}>Hints</h3>
          <ul className={styles.list}>
            {hints.map((hint, index) => (
              <li key={`${index}-${hint}`}>{hint}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.feedbackSection}>
        <button type="button" className={styles.feedbackButton} disabled={isBusy} onClick={handleFeedback}>
          {pending === 'feedback' ? 'Scoring…' : 'Get feedback'}
        </button>

        {feedback && (
          <div className={styles.result}>
            <p className={styles.score}>Score: {feedback.score ?? '—'}/100</p>

            <h4 className={styles.resultTitle}>Strengths</h4>
            <ul className={styles.list}>
              {feedback.strengths.map((item, index) => (
                <li key={`${index}-${item}`}>{item}</li>
              ))}
            </ul>

            <h4 className={styles.resultTitle}>Weaknesses</h4>
            <ul className={styles.list}>
              {feedback.weaknesses.map((item, index) => (
                <li key={`${index}-${item}`}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
