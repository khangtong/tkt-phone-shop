import express from 'express';
import { protect, isAdmin } from '../middlewares/authMiddleware.js';
import {
  createCart,
  getAllCarts,
  getCartByUserId,
  getCartById,
  addVariationToCart,
  updateCart,
  deleteCart,
} from '../controllers/cartController.js';

const router = express.Router();

router.route('/').post(protect, createCart);
router.route('/').get(protect, isAdmin, getAllCarts);
router.route('/my-cart').get(protect, getCartByUserId);
router.route('/my-cart').post(protect, addVariationToCart);
router.route('/my-cart').put(protect, updateCart);
router.route('/:id').get(protect, isAdmin, getCartById);
router.route('/:id').delete(protect, isAdmin, deleteCart);

export default router;
