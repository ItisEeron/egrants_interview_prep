import { Router } from 'express';
import * as controller from '../controllers/progressController.js';

const router = Router();

router.get('/', controller.getProgress);
router.patch('/problems/:problemId', controller.patchProblem);
router.patch('/design-chapters/:chapterId', controller.patchDesignChapter);
router.patch('/weeks/:weekId/checklist', controller.patchWeeklyChecklist);
router.patch('/final-checklist', controller.patchFinalChecklist);

export default router;
