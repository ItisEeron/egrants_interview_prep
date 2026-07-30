import codingWeeks from '../data/codingWeeks.json' with { type: 'json' };
import designChapters from '../data/designChapters.json' with { type: 'json' };
import designFramework from '../data/designFramework.json' with { type: 'json' };
import checklists from '../data/checklists.json' with { type: 'json' };

/**
 * The curriculum is static content transcribed from the two workbooks.
 * It never changes at runtime — only the user's progress does.
 */
export function getCurriculum() {
  return {
    weeks: codingWeeks.map((week) => ({
      ...week,
      designChapterIds: designChapters.filter((c) => c.weekId === week.id).map((c) => c.id),
    })),
    designChapters,
    designFramework,
    checklists,
  };
}

export function getWeek(weekId) {
  return getCurriculum().weeks.find((week) => week.id === weekId) ?? null;
}

export function getDesignChapter(chapterId) {
  return designChapters.find((chapter) => chapter.id === chapterId) ?? null;
}
