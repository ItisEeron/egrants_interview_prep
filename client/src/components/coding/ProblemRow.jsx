import { useState } from 'react';
import { Badge, DifficultyBadge } from '../common/Badge.jsx';
import { Checkbox } from '../common/Checkbox.jsx';
import { ConfidencePicker } from './ConfidencePicker.jsx';
import { ProblemNotes } from './ProblemNotes.jsx';
import { useProblemProgress, useProgress } from '../../hooks/useProgress.js';
import styles from './ProblemRow.module.css';

/**
 * The slug is stored with each problem rather than derived from its title.
 * The workbook abbreviates titles — "Validate BST" for what LeetCode calls
 * "Validate Binary Search Tree" — so deriving the slug pointed nine of the
 * fifty-two problems at pages that do not exist.
 */
function leetcodeUrl(problem) {
  return `https://leetcode.com/problems/${problem.slug}/`;
}

export function ProblemRow({ problem }) {
  const record = useProblemProgress(problem.id);
  const { updateProblem } = useProgress();
  const [notesOpen, setNotesOpen] = useState(Boolean(record.notes));

  return (
    <>
      <tr className={record.solved ? styles.solvedRow : undefined}>
        <td className={styles.order}>{problem.order}</td>
        <td>
          <a className={styles.title} href={leetcodeUrl(problem)} target="_blank" rel="noreferrer">
            {problem.leetcodeId}. {problem.title}
          </a>
          <div className={styles.meta}>
            <DifficultyBadge difficulty={problem.difficulty} />
            <span className={styles.pattern}>{problem.pattern}</span>
            {problem.mustSolve ? <Badge tone="accent">Must solve</Badge> : null}
          </div>
        </td>
        <td className={styles.stars} title={`Importance ${problem.importance} of 5`}>
          {'★'.repeat(problem.importance)}
          <span className={styles.starsDim}>{'★'.repeat(5 - problem.importance)}</span>
        </td>
        <td>
          <Checkbox
            compact
            checked={record.solved}
            onChange={(checked) => updateProblem(problem.id, { solved: checked })}
          />
        </td>
        <td>
          <Checkbox
            compact
            checked={record.reviewed}
            onChange={(checked) => updateProblem(problem.id, { reviewed: checked })}
          />
        </td>
        <td>
          <ConfidencePicker
            value={record.confidence}
            onChange={(confidence) => updateProblem(problem.id, { confidence })}
          />
        </td>
        <td>
          <button type="button" className={styles.notesToggle} onClick={() => setNotesOpen((open) => !open)}>
            {notesOpen ? 'Hide' : record.notes ? 'Notes' : 'Add'}
          </button>
        </td>
      </tr>
      {notesOpen ? (
        <tr>
          <td />
          <td colSpan={6} className={styles.notesCell}>
            <ProblemNotes
              value={record.notes}
              placeholder="What tripped you up? What would you do differently?"
              onSave={(notes) => updateProblem(problem.id, { notes })}
            />
          </td>
        </tr>
      ) : null}
    </>
  );
}
