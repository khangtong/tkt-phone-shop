import express from "express";
import {
  getOrderDetails,
  deleteOrderDetail,
} from "../controllers/orderDetailController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
// Lấy chi tiết đơn hàng
router.get("/:orderId", protect, getOrderDetails);
// Xóa một chi tiết đơn hàng
router.delete("/:id", protect, deleteOrderDetail);

export default router;
