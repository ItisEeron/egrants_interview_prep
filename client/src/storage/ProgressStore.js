/**
 * The contract every progress backend must satisfy.
 *
 * Adding a new backend means writing a module that exports these functions.
 * Nothing outside the `storage/` folder should know which backend is in use.
 *
 * `read()` resolves to `null` when nothing has been stored yet — the caller
 * seeds the first document, so every backend gets the same first-run behaviour.
 *
 * @typedef {Object} ProgressStore
 * @property {string} name
 * @property {() => Promise<ProgressDocument|null>} read
 * @property {(document: ProgressDocument) => Promise<ProgressDocument>} write
 */

/**
 * @typedef {Object} ProgressDocument
 * @property {Record<string, ProblemProgress>} problems
 * @property {Record<string, ChapterProgress>} designChapters
 * @property {Record<string, Record<string, boolean>>} weeklyChecklists  keyed by weekId, then item id
 * @property {Record<string, boolean>} finalChecklist
 */

/**
 * @typedef {Object} ProblemProgress
 * @property {boolean} solved
 * @property {boolean} reviewed
 * @property {'none'|'low'|'medium'|'high'} confidence
 * @property {string} notes
 */

/**
 * @typedef {Object} ChapterProgress
 * @property {Record<string, string>} stepNotes   keyed by framework step id
 * @property {Record<string, boolean>} checklist  keyed by practice checklist item id
 */

export const EMPTY_DOCUMENT = {
  problems: {},
  designChapters: {},
  weeklyChecklists: {},
  finalChecklist: {},
};

/**
 * Fills in any top-level key a stored document is missing, so code downstream
 * can read `document.problems` without guarding. Guards against a document
 * written by an older version of the app.
 */
export function normalizeDocument(raw) {
  return { ...structuredClone(EMPTY_DOCUMENT), ...(raw ?? {}) };
}
