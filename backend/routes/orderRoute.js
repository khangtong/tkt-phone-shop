import express from "express";
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  // updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();
//  Tạo đơn hàng
router.post("/", protect, createOrder);
//  Lấy tất cả đơn hàng (Admin)
router.get("/", protect, isAdmin, getAllOrders);
//  Lấy đơn hàng của user
router.get("/user", protect, getUserOrders);
//  Cập nhật trạng thái đơn hàng
// router.put("/:id/status", protect, isAdmin, updateOrderStatus);
//  Xóa đơn hàng
router.delete("/:id", protect, isAdmin, deleteOrder);

export default router;
