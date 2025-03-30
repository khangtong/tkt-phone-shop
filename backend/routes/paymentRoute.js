import express from 'express';
import {
	handleVNPayPayment,
	handleVNPayReturn,
	handleCODPayment,
} from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/vnpay-payment', protect, handleVNPayPayment);
router.get('/vnpay-return', handleVNPayReturn);
router.post('/cod-payment', protect, handleCODPayment);

export default router;
