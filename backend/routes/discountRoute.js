import express from 'express';
import {
	createDiscount,
	getAllDiscounts,
	getDiscountById,
	updateDiscount,
	addDiscountToVariation,
	deleteDiscount,
} from '../controllers/discountController.js';
import { protect, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, isAdmin, createDiscount);
router.put('/:id', protect, isAdmin, updateDiscount);
router.delete('/:id', protect, isAdmin, deleteDiscount);
router.get('/', getAllDiscounts);
router.get('/:id', getDiscountById);
router.put('/add/:id', protect, isAdmin, addDiscountToVariation);
export default router;
