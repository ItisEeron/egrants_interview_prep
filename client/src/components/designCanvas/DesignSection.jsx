import { DesignProvider } from '../../context/DesignContext.jsx';
import { useDesign } from '../../hooks/useDesign.js';
import { Card } from '../common/Card.jsx';
import { ErrorMessage, LoadingMessage } from '../common/StatusMessage.jsx';
import { AIAnalysis } from './AIAnalysis.jsx';
import { DesignCanvas } from './DesignCanvas.jsx';
import { DesignNotes } from './DesignNotes.jsx';
import { DesignSummary } from './DesignSummary.jsx';
import { SaveStatus } from './SaveStatus.jsx';

/**
 * Everything to do with practising one chapter's design: the diagram, the
 * reasoning behind it, and a summary of what was drawn.
 *
 * The page mounts this and nothing else — one import instead of five, and the
 * page never has to know that a design is loaded separately from progress.
 */
function DesignSectionBody({ chapter }) {
  const { isLoading, error } = useDesign();

  if (error) {
    return (
      <Card title="Your design">
        <ErrorMessage error={error} />
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card title="Your design">
        <LoadingMessage />
      </Card>
    );
  }

  return (
    <>
      <Card title="Your design" action={<SaveStatus />}>
        <DesignCanvas />
      </Card>

      <Card title="Thinking and assumptions">
        <DesignNotes />
      </Card>

      <Card title="Design summary">
        <DesignSummary chapter={chapter} />
      </Card>

      <Card title="AI critique">
        <AIAnalysis chapter={chapter} />
      </Card>
    </>
  );
}

export function DesignSection({ chapter }) {
  return (
    <DesignProvider chapterId={chapter.id}>
      <DesignSectionBody chapter={chapter} />
    </DesignProvider>
  );
}
