import * as curriculumService from '../services/curriculumService.js';

export function getCurriculum(req, res) {
  res.json(curriculumService.getCurriculum());
}

export function getWeek(req, res) {
  const week = curriculumService.getWeek(req.params.weekId);
  if (!week) return res.status(404).json({ error: 'Week not found' });
  res.json(week);
}

export function getDesignChapter(req, res) {
  const chapter = curriculumService.getDesignChapter(req.params.chapterId);
  if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
  res.json(chapter);
}
