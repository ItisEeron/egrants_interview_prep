import { Handle, Position } from '@xyflow/react';
import { componentKind } from '../../constants/designNodes.js';
import { useDesign } from '../../hooks/useDesign.js';
import styles from './ComponentNode.module.css';

/**
 * One box on the canvas.
 *
 * The fields write straight to the shared design on every keystroke rather than
 * holding a draft and saving on blur, the way notes elsewhere in the app do.
 * Saves here are already debounced, so a keystroke costs a re-render and
 * nothing else — and the canvas has no natural blur, since you are as likely to
 * drag a node away as to tab out of it.
 *
 * The `nodrag` class is React Flow's: without it, selecting text with the mouse
 * would drag the node instead.
 */
export function ComponentNode({ id, data, selected }) {
  const { updateNodeData } = useDesign();
  const kind = componentKind(data.kind);

  return (
    <div
      className={selected ? `${styles.node} ${styles.selected}` : styles.node}
      style={{ '--kind-color': kind.color }}
    >
      <Handle type="target" id="top" position={Position.Top} className={styles.handle} />
      <Handle type="target" id="left" position={Position.Left} className={styles.handle} />

      <span className={styles.kind}>{kind.label}</span>

      <input
        className={`${styles.label} nodrag`}
        value={data.label}
        aria-label="Component name"
        onChange={(event) => updateNodeData(id, { label: event.target.value })}
      />

      <input
        className={`${styles.detail} nodrag`}
        value={data.detail}
        placeholder={kind.hint}
        aria-label="Component detail"
        onChange={(event) => updateNodeData(id, { detail: event.target.value })}
      />

      <Handle type="source" id="right" position={Position.Right} className={styles.handle} />
      <Handle type="source" id="bottom" position={Position.Bottom} className={styles.handle} />
    </div>
  );
}
