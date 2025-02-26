import express from 'express';
import { protect, isAdmin } from '../middlewares/authMiddleware.js';
import {
  createCart,
  getAllCarts,
  getCartByUserId,
  getCartById,
} from '../controllers/cartController.js';

const router = express.Router();

router.route('/').post(protect, createCart);
router.route('/').get(protect, isAdmin, getAllCarts);
router.route('/my-cart').get(protect, getCartByUserId);
router.route('/:id').get(protect, isAdmin, getCartById);

export default router;
