import express from "express";
import {
  handleVNPayPayment,
  handleVNPayReturn,
  handleCODPayment,
  getUserPayments,
} from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/vnpay-payment", protect, handleVNPayPayment);
router.get("/vnpay-return", handleVNPayReturn);
router.post("/cod-payment", protect, handleCODPayment);
router.get("/user", protect, getUserPayments);
export default router;
