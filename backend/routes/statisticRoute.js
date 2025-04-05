import express from 'express';

import { protect, isAdmin } from '../middlewares/authMiddleware.js';
import { getStatistics } from '../controllers/statisticController.js';

const router = express.Router();

router.route('/').get(protect, isAdmin, getStatistics);

export default router;
