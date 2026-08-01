/**
 * The catalog of things you can put on a system design canvas.
 *
 * Every node stores its `kind` from this list. That is the difference between
 * a drawing and data: a plain rectangle labelled "Redis" means nothing to
 * anything but a human reading it, whereas `kind: 'cache'` can be counted,
 * validated, and eventually described to a model asked to critique the design.
 *
 * Adding a component type is a matter of adding an entry here — the palette,
 * the node rendering, and the summary all read from this one list.
 */
export const COMPONENT_KINDS = [
  {
    kind: 'client',
    label: 'Client',
    color: '#6c8cff',
    hint: 'Browser, mobile app, or other caller',
  },
  {
    kind: 'gateway',
    label: 'API Gateway',
    color: '#8b7cff',
    hint: 'Entry point: auth, routing, rate limiting',
  },
  {
    kind: 'loadBalancer',
    label: 'Load Balancer',
    color: '#4fb0d8',
    hint: 'Spreads traffic across instances',
  },
  {
    kind: 'service',
    label: 'Service',
    color: '#46c98b',
    hint: 'Application server or microservice',
  },
  {
    kind: 'database',
    label: 'Database',
    color: '#e8b64c',
    hint: 'Durable store — note the engine and sharding key',
  },
  {
    kind: 'cache',
    label: 'Cache',
    color: '#e8695c',
    hint: 'Redis, Memcached — note the eviction policy',
  },
  {
    kind: 'queue',
    label: 'Queue',
    color: '#d98cc4',
    hint: 'Kafka, SQS — decouples producers from consumers',
  },
  {
    kind: 'storage',
    label: 'Object Store',
    color: '#9aa7bd',
    hint: 'S3, GCS — blobs, images, backups',
  },
  {
    kind: 'cdn',
    label: 'CDN',
    color: '#5ec8c0',
    hint: 'Edge cache for static or media content',
  },
  {
    kind: 'search',
    label: 'Search Index',
    color: '#c5a3ff',
    hint: 'Elasticsearch — note what is indexed',
  },
  {
    kind: 'external',
    label: 'External API',
    color: '#8d93a5',
    hint: 'Third party you do not control',
  },
];

const FALLBACK_KIND = {
  kind: 'unknown',
  label: 'Component',
  color: '#8d93a5',
  hint: '',
};

/**
 * Looks up a kind's presentation. Falls back rather than throwing so a design
 * saved before a kind was renamed still renders instead of blanking the canvas.
 */
export function componentKind(kind) {
  return COMPONENT_KINDS.find((entry) => entry.kind === kind) ?? FALLBACK_KIND;
}

/**
 * Builds a node the canvas can drop straight into React Flow.
 *
 * `type: 'component'` points at our own renderer rather than React Flow's
 * built-in one; see `nodeTypes` in DesignCanvas.
 */
export function createComponentNode(kind, position) {
  const { label } = componentKind(kind);

  return {
    id: crypto.randomUUID(),
    type: 'component',
    position,
    data: { kind, label, detail: '' },
  };
}
