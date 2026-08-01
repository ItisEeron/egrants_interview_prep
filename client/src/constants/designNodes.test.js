import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { COMPONENT_KINDS, componentKind, createComponentNode } from './designNodes.js';

describe('componentKind', () => {
  it('falls back instead of throwing when a kind is unknown', () => {
    // A design saved before a kind was renamed must still render.
    assert.equal(componentKind('renamed-since').label, 'Component');
  });

  it('has a unique key and a colour for every entry', () => {
    const kinds = COMPONENT_KINDS.map((entry) => entry.kind);
    assert.equal(new Set(kinds).size, kinds.length);
    assert.ok(COMPONENT_KINDS.every((entry) => /^#[0-9a-f]{6}$/i.test(entry.color)));
  });
});

describe('createComponentNode', () => {
  it('carries the semantic kind, which is what makes the graph readable', () => {
    const node = createComponentNode('queue', { x: 10, y: 20 });

    assert.equal(node.type, 'component');
    assert.equal(node.data.kind, 'queue');
    assert.equal(node.data.label, 'Queue');
    assert.deepEqual(node.position, { x: 10, y: 20 });
  });

  it('gives every node its own id', () => {
    const a = createComponentNode('service', { x: 0, y: 0 });
    const b = createComponentNode('service', { x: 0, y: 0 });

    assert.notEqual(a.id, b.id);
  });
});
