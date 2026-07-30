import { apiClient } from './client.js';

export const progressApi = {
  fetchProgress: () => apiClient.get('/progress'),

  updateProblem: (problemId, changes) => apiClient.patch(`/progress/problems/${problemId}`, changes),

  updateChapterStepNotes: (chapterId, stepId, notes) =>
    apiClient.patch(`/progress/design-chapters/${chapterId}`, { stepId, notes }),

  updateChapterChecklist: (chapterId, checklistItemId, checked) =>
    apiClient.patch(`/progress/design-chapters/${chapterId}`, { checklistItemId, checked }),

  updateWeeklyChecklist: (weekId, itemId, checked) =>
    apiClient.patch(`/progress/weeks/${weekId}/checklist`, { itemId, checked }),

  updateFinalChecklist: (itemId, checked) =>
    apiClient.patch('/progress/final-checklist', { itemId, checked }),
};
