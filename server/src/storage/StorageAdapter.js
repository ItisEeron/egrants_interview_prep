/**
 * The contract every storage backend must satisfy.
 *
 * Adding a new backend means writing a module that exports these two functions.
 * Nothing outside the `storage/` folder should know which backend is in use.
 *
 * @typedef {Object} StorageAdapter
 * @property {string} name
 * @property {() => Promise<ProgressDocument>} read
 * @property {(document: ProgressDocument) => Promise<ProgressDocument>} write
 */

/**
 * @typedef {Object} ProgressDocument
 * @property {Record<string, ProblemProgress>} problems
 * @property {Record<string, ChapterProgress>} designChapters
 * @property {Record<string, Record<string, boolean>>} weeklyChecklists  keyed by weekId, then checklist item id
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
