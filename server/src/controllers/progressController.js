import * as progressService from '../services/progressService.js';

export async function getProgress(req, res, next) {
  try {
    res.json(await progressService.getProgress());
  } catch (error) {
    next(error);
  }
}

export async function patchProblem(req, res, next) {
  try {
    res.json(await progressService.updateProblem(req.params.problemId, req.body));
  } catch (error) {
    next(error);
  }
}

export async function patchDesignChapter(req, res, next) {
  try {
    res.json(await progressService.updateDesignChapter(req.params.chapterId, req.body));
  } catch (error) {
    next(error);
  }
}

export async function patchWeeklyChecklist(req, res, next) {
  try {
    const { itemId, checked } = req.body;
    res.json(await progressService.updateWeeklyChecklist(req.params.weekId, itemId, checked));
  } catch (error) {
    next(error);
  }
}

export async function patchFinalChecklist(req, res, next) {
  try {
    const { itemId, checked } = req.body;
    res.json(await progressService.updateFinalChecklist(itemId, checked));
  } catch (error) {
    next(error);
  }
}
