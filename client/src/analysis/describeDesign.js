import { componentKind } from '../constants/designNodes.js';

/**
 * Turns a stored design into a plain description of what it contains.
 *
 * This is the seam for design critique. React Flow's own shapes are full of
 * detail that only matters on screen — pixel positions, selection flags,
 * measured widths — and none of it says anything about the design. This
 * function throws that away and keeps the part that carries meaning: which
 * components exist, what talks to what, and the reasoning written alongside.
 *
 * Today that description feeds the summary under the canvas. It is also the
 * shape you would serialise into a prompt to have an agent critique the
 * design, which is why it is a pure function with no React in it and no
 * knowledge of what happens to its output. Adding that later means writing a
 * caller, not rewriting this.
 *
 * @returns {DesignDescription}
 */
export function describeDesign(design, chapter) {
  const components = design.nodes.map((node) => {
    const kind = componentKind(node.data.kind);
    return {
      id: node.id,
      kind: node.data.kind,
      kindLabel: kind.label,
      // An unnamed box still has a type, so fall back to it rather than
      // describing something as "".
      label: node.data.label?.trim() || kind.label,
      detail: node.data.detail?.trim() || '',
    };
  });

  const labelById = new Map(components.map((component) => [component.id, component.label]));

  // A node can be deleted while an edge still references it for a frame.
  // Dropping those keeps the description free of connections to nothing.
  const connections = design.edges
    .filter((edge) => labelById.has(edge.source) && labelById.has(edge.target))
    .map((edge) => ({
      from: labelById.get(edge.source),
      to: labelById.get(edge.target),
      label: typeof edge.label === 'string' ? edge.label.trim() : '',
    }));

  const connectedIds = new Set();
  for (const edge of design.edges) {
    connectedIds.add(edge.source);
    connectedIds.add(edge.target);
  }

  const countsByKind = {};
  for (const component of components) {
    countsByKind[component.kind] = (countsByKind[component.kind] ?? 0) + 1;
  }

  return {
    chapter: chapter ? { id: chapter.id, title: chapter.title } : null,
    components,
    connections,
    countsByKind,
    // Drawn but never wired up — usually a component you meant to connect.
    unconnected: components
      .filter((component) => !connectedIds.has(component.id))
      .map((component) => component.label),
    notes: design.notes.trim(),
  };
}

/**
 * @typedef {Object} DesignDescription
 * @property {{id: string, title: string}|null} chapter
 * @property {Array<{id: string, kind: string, kindLabel: string, label: string, detail: string}>} components
 * @property {Array<{from: string, to: string, label: string}>} connections
 * @property {Record<string, number>} countsByKind
 * @property {string[]} unconnected
 * @property {string} notes
 */
