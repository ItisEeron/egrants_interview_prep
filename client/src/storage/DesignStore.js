/**
 * The contract every design backend must satisfy.
 *
 * This mirrors ProgressStore deliberately: same function names, same `null`
 * meaning "nothing stored yet". Adding a backend means writing a module that
 * exports these two functions, and nothing outside `storage/` knows which one
 * is in use.
 *
 * Designs are stored separately from progress, one document per chapter, for
 * two reasons. Progress is written in full on every edit, and a diagram is far
 * larger than a checkbox — dragging a node would rewrite every note in the
 * account. And only one chapter's diagram is ever on screen, so there is no
 * reason to load ten of them.
 *
 * @typedef {Object} DesignStore
 * @property {string} name
 * @property {() => Promise<DesignDocument|null>} read
 * @property {(design: DesignDocument) => Promise<DesignDocument>} write
 */

/**
 * What one chapter's design looks like on disk.
 *
 * `nodes` and `edges` keep React Flow's field names, so the canvas can hand
 * them straight back without a translation layer, but only the fields listed
 * in `toStoredDesign` are written. The part that is ours is `node.data.kind`:
 * it names what a box represents (a database, a cache, a queue) rather than
 * leaving it an anonymous rectangle. That is what makes the graph readable by
 * something other than a human later on.
 *
 * @typedef {Object} DesignDocument
 * @property {number} schemaVersion
 * @property {Array<Object>} nodes   React Flow nodes; `data.kind` carries the meaning
 * @property {Array<Object>} edges   React Flow edges; `label` carries the protocol or payload
 * @property {string} notes          thoughts, assumptions, tradeoffs
 */

/**
 * Bumped only when a stored design would need rewriting to stay readable.
 * `normalizeDesign` is where that migration would go.
 */
export const DESIGN_SCHEMA_VERSION = 1;

export const EMPTY_DESIGN = {
  schemaVersion: DESIGN_SCHEMA_VERSION,
  nodes: [],
  edges: [],
  notes: '',
};

/**
 * Reduces a design to what is worth storing.
 *
 * React Flow hangs bookkeeping on nodes and edges as you interact with them:
 * measured pixel sizes, selection flags, resolved absolute positions. None of
 * it describes the design, all of it grows the document, and it is stale the
 * moment it is read back on a different screen. Listing the fields explicitly
 * means the stored shape is one we define, rather than whatever version of the
 * library happened to write it.
 *
 * Every backend writes through this, so all of them store the same thing.
 */
export function toStoredDesign(design) {
  return {
    schemaVersion: DESIGN_SCHEMA_VERSION,
    nodes: design.nodes.map(({ id, type, position, data }) => ({ id, type, position, data })),
    edges: design.edges.map(({ id, source, target, sourceHandle, targetHandle, label }) => ({
      id,
      source,
      target,
      sourceHandle,
      targetHandle,
      label,
    })),
    notes: design.notes,
  };
}

/**
 * Fills in anything a stored design is missing so callers can read
 * `design.nodes` without guarding, and drops values of the wrong type rather
 * than letting them reach React Flow, which throws on a non-array.
 */
export function normalizeDesign(raw) {
  const stored = raw ?? {};

  return {
    ...structuredClone(EMPTY_DESIGN),
    ...stored,
    nodes: Array.isArray(stored.nodes) ? stored.nodes : [],
    edges: Array.isArray(stored.edges) ? stored.edges : [],
    notes: typeof stored.notes === 'string' ? stored.notes : '',
  };
}
