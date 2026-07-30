import { apiClient } from './client.js';

export const curriculumApi = {
  fetchCurriculum: () => apiClient.get('/curriculum'),
};
