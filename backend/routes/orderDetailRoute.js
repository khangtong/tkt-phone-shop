import express from "express";
import orderDetailController from "../controllers/orderDetailController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get order details by order ID (protected route)
router.get(
  "/order/:orderId",
  protect,
  orderDetailController.getOrderDetailsByOrderId
);
router.post("/", protect, orderDetailController.createOrderDetail);
// Update order detail (admin/seller only)
router.put("/:id", protect, orderDetailController.updateOrderDetail);

// Delete order detail (admin/seller only)
router.delete("/:id", protect, orderDetailController.deleteOrderDetail);
export default router;
