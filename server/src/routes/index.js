import { Router } from 'express';
import curriculumRoutes from './curriculumRoutes.js';
import progressRoutes from './progressRoutes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true }));
router.use('/curriculum', curriculumRoutes);
router.use('/progress', progressRoutes);

export default router;
