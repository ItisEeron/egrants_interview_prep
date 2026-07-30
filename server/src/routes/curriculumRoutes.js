import { Router } from 'express';
import * as controller from '../controllers/curriculumController.js';

const router = Router();

router.get('/', controller.getCurriculum);
router.get('/weeks/:weekId', controller.getWeek);
router.get('/design-chapters/:chapterId', controller.getDesignChapter);

export default router;
