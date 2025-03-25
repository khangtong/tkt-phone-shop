import express from 'express';
import { createPayment, paymentCallback } from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/create-payment', protect, createPayment);
router.get('/payment-callback', paymentCallback);

export default router;
