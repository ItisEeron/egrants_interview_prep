import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { describeDesign } from './describeDesign.js';

const nodes = [
  { id: 'a', data: { kind: 'client', label: 'Mobile app', detail: '' } },
  { id: 'b', data: { kind: 'service', label: 'API', detail: 'Go' } },
  { id: 'c', data: { kind: 'cache', label: '', detail: '' } },
];

describe('describeDesign', () => {
  it('describes connections by what they join, not by node id', () => {
    const description = describeDesign(
      { nodes, edges: [{ source: 'a', target: 'b', label: '  HTTPS  ' }], notes: '' },
      { id: 'ch-1', title: 'Design a URL shortener' },
    );

    assert.deepEqual(description.connections, [{ from: 'Mobile app', to: 'API', label: 'HTTPS' }]);
    assert.equal(description.chapter.title, 'Design a URL shortener');
  });

  it('names an unlabelled component by its kind', () => {
    const description = describeDesign({ nodes, edges: [], notes: '' }, null);
    assert.ok(description.components.some((component) => component.label === 'Cache'));
  });

  it('reports components that were drawn but never wired up', () => {
    const description = describeDesign(
      { nodes, edges: [{ source: 'a', target: 'b', label: '' }], notes: '' },
      null,
    );

    assert.deepEqual(description.unconnected, ['Cache']);
  });

  it('ignores a connection to a node that no longer exists', () => {
    // A node can be deleted while an edge still references it for a frame.
    const description = describeDesign(
      { nodes, edges: [{ source: 'a', target: 'deleted', label: '' }], notes: '' },
      null,
    );

    assert.deepEqual(description.connections, []);
  });

  it('counts components by kind', () => {
    const description = describeDesign({ nodes, edges: [], notes: '' }, null);
    assert.deepEqual(description.countsByKind, { client: 1, service: 1, cache: 1 });
  });

  it('carries the notes through, trimmed', () => {
    const description = describeDesign({ nodes: [], edges: [], notes: '  10M DAU  ' }, null);
    assert.equal(description.notes, '10M DAU');
  });
});
