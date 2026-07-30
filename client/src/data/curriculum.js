import codingWeeks from './codingWeeks.json';
import designChapters from './designChapters.json';
import designFramework from './designFramework.json';
import checklists from './checklists.json';

/**
 * The curriculum is static content transcribed from the two workbooks. It never
 * changes at runtime — only the user's progress does — so it is bundled into the
 * build rather than fetched.
 */
export const curriculum = {
  weeks: codingWeeks.map((week) => ({
    ...week,
    designChapterIds: designChapters.filter((c) => c.weekId === week.id).map((c) => c.id),
  })),
  designChapters,
  designFramework,
  checklists,
};
