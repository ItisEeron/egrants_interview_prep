import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createDesignStore, loadDesign } from '../storage/index.js';
import { useAuth } from './AuthContext.jsx';

/**
 * Holds one chapter's diagram and its notes.
 *
 * This is mounted per chapter rather than around the whole app: only one design
 * is ever on screen, and scoping it here means switching chapters loads exactly
 * one document and throws it away on the way out.
 *
 * Saving is debounced. Dragging a node fires a change event on every mouse
 * move, and writing each one would be both wasteful and a race. Instead the
 * newest document is parked in a ref and written once the user pauses; a burst
 * of edits collapses into a single write of the final state. Navigating away
 * flushes whatever is still pending, so the last edit is never the lost one.
 *
 * As in ProgressContext, a failed write does not roll the change back. The
 * store holds one document, so rolling back would discard everything since the
 * last successful write. The change stays on screen and the next edit retries.
 */
const DesignContext = createContext(null);

const SAVE_DELAY_MS = 800;

export function DesignProvider({ chapterId, children }) {
  const { user } = useAuth();
  const store = useMemo(() => createDesignStore(user, chapterId), [user, chapterId]);

  const [design, setDesign] = useState(null);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Mirrors `design` so an edit can read the current document without waiting
  // for a re-render, and so two edits in one tick cannot clobber each other.
  const designRef = useRef(null);
  // The document waiting to be written, and whether a write is in flight.
  const pendingRef = useRef(null);
  const isWritingRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    designRef.current = null;
    setDesign(null);
    setError(null);

    loadDesign(store)
      .then((document) => {
        if (cancelled) return;
        designRef.current = document;
        setDesign(document);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError);
      });

    return () => {
      cancelled = true;
    };
  }, [store]);

  const persist = useCallback(async () => {
    if (isWritingRef.current) return;

    isWritingRef.current = true;
    setIsSaving(true);
    try {
      while (pendingRef.current) {
        const next = pendingRef.current;
        pendingRef.current = null;
        await store.write(next);
      }
      setSaveError(null);
    } catch (writeError) {
      pendingRef.current = null;
      setSaveError(writeError);
    } finally {
      isWritingRef.current = false;
      setIsSaving(false);
    }
  }, [store]);

  const scheduleSave = useCallback(
    (document) => {
      pendingRef.current = document;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(persist, SAVE_DELAY_MS);
    },
    [persist],
  );

  // Leaving the chapter cancels the pending timer, so the write has to happen
  // here or the last edit is lost. There is no state left to update by then,
  // which is why a failure can only be swallowed.
  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
      const pending = pendingRef.current;
      pendingRef.current = null;
      if (pending) store.write(pending).catch(() => {});
    },
    [store],
  );

  const applyChange = useCallback(
    (produceNextState) => {
      const current = designRef.current;
      if (!current) return;

      const next = produceNextState(current);
      designRef.current = next;
      setDesign(next);
      scheduleSave(next);
    },
    [scheduleSave],
  );

  // React Flow hands back either the next array or a function of the previous
  // one, matching the `setState` shape its own hooks use.
  const updateNodes = useCallback(
    (nodesOrUpdater) =>
      applyChange((current) => ({
        ...current,
        nodes: typeof nodesOrUpdater === 'function' ? nodesOrUpdater(current.nodes) : nodesOrUpdater,
      })),
    [applyChange],
  );

  const updateEdges = useCallback(
    (edgesOrUpdater) =>
      applyChange((current) => ({
        ...current,
        edges: typeof edgesOrUpdater === 'function' ? edgesOrUpdater(current.edges) : edgesOrUpdater,
      })),
    [applyChange],
  );

  const updateNodeData = useCallback(
    (nodeId, changes) =>
      applyChange((current) => ({
        ...current,
        nodes: current.nodes.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...changes } } : node,
        ),
      })),
    [applyChange],
  );

  // What a connection means — "writes to", "async", "gRPC" — is part of the
  // design, not decoration. It is stored on the edge so a reader (or a model)
  // gets the relationship, not just the fact that two boxes touch.
  const updateEdgeLabel = useCallback(
    (edgeId, label) =>
      applyChange((current) => ({
        ...current,
        edges: current.edges.map((edge) => (edge.id === edgeId ? { ...edge, label } : edge)),
      })),
    [applyChange],
  );

  const updateNotes = useCallback(
    (notes) => applyChange((current) => ({ ...current, notes })),
    [applyChange],
  );

  const value = {
    design,
    error,
    saveError,
    isSaving,
    isLoading: !design && !error,
    updateNodes,
    updateEdges,
    updateNodeData,
    updateEdgeLabel,
    updateNotes,
  };

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}

export function useDesignContext() {
  const context = useContext(DesignContext);
  if (!context) throw new Error('useDesignContext must be used inside <DesignProvider>');
  return context;
}
