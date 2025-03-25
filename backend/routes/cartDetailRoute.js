import express from 'express';
import { protect, isAdmin } from '../middlewares/authMiddleware.js';
import {
  createCartDetail,
  getCartDetailById,
  updateCartDetail,
  deleteCartDetail,
  getAllCartDetails,
} from '../controllers/cartDetailController.js';

const router = express.Router();

// Only authenticated users can create or view their cart details.
// Admins can get a list of all cart details and delete a cart detail.
router
  .route('/')
  .post(protect, createCartDetail)
  .get(protect, isAdmin, getAllCartDetails);

router
  .route('/:id')
  .get(protect, getCartDetailById)
  .put(protect, updateCartDetail)
  .delete(protect, deleteCartDetail);

export default router;
