import { useMemo } from 'react';
import { describeDesign } from '../../analysis/describeDesign.js';
import { componentKind } from '../../constants/designNodes.js';
import { useDesign } from '../../hooks/useDesign.js';
import styles from './DesignSummary.module.css';

/**
 * A readout of what is currently on the canvas.
 *
 * Everything here comes from `describeDesign`, the same description an agent
 * would be given to critique the design. Keeping the on-screen summary on that
 * path means the description stays honest: if it ever stopped reflecting the
 * diagram, this would visibly break.
 */
export function DesignSummary({ chapter }) {
  const { design } = useDesign();
  const description = useMemo(() => describeDesign(design, chapter), [design, chapter]);

  if (description.components.length === 0) {
    return <p className={styles.empty}>Add components above and this will summarise the design.</p>;
  }

  return (
    <div className={styles.summary}>
      <p className={styles.counts}>
        {description.components.length} component{description.components.length === 1 ? '' : 's'} ·{' '}
        {description.connections.length} connection{description.connections.length === 1 ? '' : 's'}
      </p>

      <div className={styles.chips}>
        {Object.entries(description.countsByKind).map(([kind, count]) => (
          <span key={kind} className={styles.chip} style={{ '--kind-color': componentKind(kind).color }}>
            <span className={styles.dot} aria-hidden="true" />
            {componentKind(kind).label}
            {count > 1 && <span className={styles.count}>{count}</span>}
          </span>
        ))}
      </div>

      {description.unconnected.length > 0 && (
        <p className={styles.warning}>
          Not connected to anything: {description.unconnected.join(', ')}
        </p>
      )}
    </div>
  );
}
