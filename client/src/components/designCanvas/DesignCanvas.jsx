import { useCallback, useRef } from 'react';
import {
  Background,
  ConnectionMode,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { componentKind, createComponentNode } from '../../constants/designNodes.js';
import { useDesign } from '../../hooks/useDesign.js';
import { ComponentNode } from './ComponentNode.jsx';
import { EdgeInspector } from './EdgeInspector.jsx';
import { NodePalette } from './NodePalette.jsx';
import styles from './DesignCanvas.module.css';

// Both are defined out here on purpose: React Flow compares these by identity
// and warns (and re-mounts every node) if a new object arrives each render.
const nodeTypes = { component: ComponentNode };
const defaultEdgeOptions = { markerEnd: { type: MarkerType.ArrowClosed } };

// Without a ceiling, opening a chapter with two or three nodes close together
// zooms until they fill the canvas at several times their real size.
const fitViewOptions = { maxZoom: 1, padding: 0.25 };

// A new component lands in the middle of what you are looking at. Adding
// several in a row would stack them exactly, so each is nudged down-right of
// the last until the cycle repeats.
const CASCADE_STEP = 28;
const CASCADE_LENGTH = 6;

function Canvas() {
  const { design, updateNodes, updateEdges, updateEdgeLabel } = useDesign();
  const wrapperRef = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  // React Flow reports an empty batch of changes when it mounts. Passing that
  // through would mark the design dirty and write it, so merely opening a
  // chapter would create a stored document for a diagram nobody has drawn.
  const onNodesChange = useCallback(
    (changes) => {
      if (changes.length === 0) return;
      updateNodes((nodes) => applyNodeChanges(changes, nodes));
    },
    [updateNodes],
  );

  const onEdgesChange = useCallback(
    (changes) => {
      if (changes.length === 0) return;
      updateEdges((edges) => applyEdgeChanges(changes, edges));
    },
    [updateEdges],
  );

  // Loose mode lets any handle connect to any other, so a connection is
  // directed by which end you dragged from rather than by how the handles were
  // typed. See the note in ComponentNode.
  const onConnect = useCallback(
    (connection) => updateEdges((edges) => addEdge(connection, edges)),
    [updateEdges],
  );

  const addComponent = useCallback(
    (kind) => {
      const bounds = wrapperRef.current.getBoundingClientRect();
      const center = screenToFlowPosition({
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2,
      });

      updateNodes((nodes) => {
        const offset = (nodes.length % CASCADE_LENGTH) * CASCADE_STEP;
        const position = { x: center.x + offset, y: center.y + offset };
        return [...nodes, createComponentNode(kind, position)];
      });
    },
    [screenToFlowPosition, updateNodes],
  );

  const selectedEdges = design.edges.filter((edge) => edge.selected);

  return (
    <>
      <NodePalette onAddComponent={addComponent} />

      {selectedEdges.length === 1 && (
        <EdgeInspector edge={selectedEdges[0]} onLabelChange={updateEdgeLabel} />
      )}

      <div className={styles.canvas} ref={wrapperRef}>
        <ReactFlow
          nodes={design.nodes}
          edges={design.edges}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          connectionMode={ConnectionMode.Loose}
          colorMode="dark"
          fitView
          fitViewOptions={fitViewOptions}
          minZoom={0.2}
        >
          <Background gap={16} />
          <Controls showInteractive={false} />
          <MiniMap
            pannable
            zoomable
            nodeColor={(node) => componentKind(node.data.kind).color}
            maskColor="rgba(15, 17, 23, 0.7)"
          />
        </ReactFlow>
      </div>

      <p className={styles.hint}>
        Drag from a node's edge to connect it. Select a connection to label it, and press Delete to
        remove whatever is selected.
      </p>
    </>
  );
}

/**
 * The system design canvas for one chapter.
 *
 * ReactFlowProvider is what lets the palette ask where the viewport is looking
 * without being rendered inside the canvas itself.
 */
export function DesignCanvas() {
  return (
    <ReactFlowProvider>
      <Canvas />
    </ReactFlowProvider>
  );
}
