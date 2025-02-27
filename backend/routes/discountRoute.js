import express from 'express';
import {
	createDiscount,
	getAllDiscounts,
	getDiscountById,
	updateDiscount,
	addDiscountToVariation,
} from '../controllers/discountController.js';
import { protect, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, isAdmin, createDiscount);
router.get('/', getAllDiscounts);
router.get('/:id', getDiscountById);
router.put('/:id', updateDiscount);
router.put('/add/:id', addDiscountToVariation);
export default router;
