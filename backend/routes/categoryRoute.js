import express from 'express';
import { protect, isAdmin } from '../middlewares/authMiddleware.js';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';

const router = express.Router();

router.post('/', protect, isAdmin, createCategory);
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.put('/:id', protect, isAdmin, updateCategory);
router.delete('/:id', protect, isAdmin, deleteCategory);

export default router;
