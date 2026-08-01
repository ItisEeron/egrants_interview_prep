import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { EMPTY_DESIGN, normalizeDesign, toStoredDesign } from './DesignStore.js';

describe('toStoredDesign', () => {
  it('drops the bookkeeping React Flow hangs on a node', () => {
    const stored = toStoredDesign({
      nodes: [
        {
          id: 'n1',
          type: 'component',
          position: { x: 1, y: 2 },
          data: { kind: 'cache', label: 'Redis', detail: '' },
          // All of the following are React Flow's, not ours.
          measured: { width: 192, height: 82 },
          selected: true,
          dragging: false,
          internals: {},
        },
      ],
      edges: [],
      notes: '',
    });

    assert.deepEqual(Object.keys(stored.nodes[0]).sort(), ['data', 'id', 'position', 'type']);
  });

  it('keeps what a connection means but not whether it is selected', () => {
    const stored = toStoredDesign({
      nodes: [],
      edges: [
        {
          id: 'e1',
          source: 'a',
          target: 'b',
          sourceHandle: 'right',
          targetHandle: 'left',
          label: 'writes to',
          selected: true,
          markerEnd: { type: 'arrowclosed' },
        },
      ],
      notes: '',
    });

    assert.equal(stored.edges[0].label, 'writes to');
    assert.equal(stored.edges[0].sourceHandle, 'right');
    assert.equal(stored.edges[0].selected, undefined);
  });

  it('survives a round trip through JSON and back', () => {
    const original = {
      nodes: [
        {
          id: 'n1',
          type: 'component',
          position: { x: 5, y: 6 },
          data: { kind: 'database', label: 'Users', detail: 'sharded by user_id' },
        },
      ],
      edges: [],
      notes: 'about 10M rows',
    };

    const back = normalizeDesign(JSON.parse(JSON.stringify(toStoredDesign(original))));

    assert.equal(back.nodes[0].data.kind, 'database');
    assert.equal(back.nodes[0].data.detail, 'sharded by user_id');
    assert.equal(back.notes, 'about 10M rows');
    assert.equal(back.schemaVersion, EMPTY_DESIGN.schemaVersion);
  });
});

describe('normalizeDesign', () => {
  it('repairs a document of the wrong shape rather than letting it reach the canvas', () => {
    // React Flow throws on a non-array, which would blank the page.
    const design = normalizeDesign({ nodes: 'not-an-array', edges: null, notes: 42 });

    assert.deepEqual(design.nodes, []);
    assert.deepEqual(design.edges, []);
    assert.equal(design.notes, '');
  });

  it('treats nothing stored as an empty canvas', () => {
    assert.deepEqual(normalizeDesign(null), EMPTY_DESIGN);
  });
});
