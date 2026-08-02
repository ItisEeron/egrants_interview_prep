import { useState } from 'react';
import { describeDesign } from '../../analysis/describeDesign.js';
import { requestFeedback, requestFollowUpQuestions, requestHint } from '../../ai/designCritique.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDesign } from '../../hooks/useDesign.js';
import styles from './AIAnalysis.module.css';

const ERROR_MESSAGE = "Couldn't reach the AI just now — try again in a moment.";

/**
 * An optional AI critique of the diagram, on request only.
 *
 * Three separate actions rather than one combined call: analyzing and asking
 * for a hint are both things you'd want mid-design, repeatedly, as the diagram
 * changes — feedback is the opposite, a final score you ask for once you're
 * done, so it never fires as a side effect of the other two.
 */
export function AIAnalysis({ chapter }) {
  const { isEnabled, user, signIn } = useAuth();
  const { design } = useDesign();
  const [questions, setQuestions] = useState(null);
  const [hints, setHints] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [pending, setPending] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isEnabled) {
    return <p className={styles.muted}>AI critique needs Firebase configured for this project.</p>;
  }

  if (!user) {
    return (
      <div className={styles.signedOut}>
        <p className={styles.muted}>Sign in to get an AI critique of this design.</p>
        <button type="button" className={styles.secondaryButton} onClick={signIn}>
          Continue with Google
        </button>
      </div>
    );
  }

  const sessionContext = { questions: questions ?? [], hints };

  async function run(action, task) {
    setPending(action);
    setErrorMessage(null);
    try {
      await task();
    } catch (error) {
      console.error('AI critique request failed:', error);
      setErrorMessage(ERROR_MESSAGE);
    } finally {
      setPending(null);
    }
  }

  const handleAnalyze = () =>
    run('analyze', async () => {
      setQuestions(await requestFollowUpQuestions(describeDesign(design, chapter)));
    });

  const handleHint = () =>
    run('hint', async () => {
      const hint = await requestHint(describeDesign(design, chapter), sessionContext);
      setHints((prev) => [...prev, hint]);
    });

  const handleFeedback = () =>
    run('feedback', async () => {
      setFeedback(await requestFeedback(describeDesign(design, chapter), sessionContext));
    });

  const isBusy = pending !== null;

  return (
    <div className={styles.panel}>
      <div className={styles.actions}>
        <button type="button" className={styles.primaryButton} disabled={isBusy} onClick={handleAnalyze}>
          {pending === 'analyze' ? 'Analyzing…' : 'Analyze my design'}
        </button>
        <button type="button" className={styles.secondaryButton} disabled={isBusy} onClick={handleHint}>
          {pending === 'hint' ? 'Thinking…' : 'Get a hint'}
        </button>
      </div>

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
