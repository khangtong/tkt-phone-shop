import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Lấy tất cả sản phẩm
router.get("/", getAllProducts);

// Lấy sản phẩm theo ID
router.get("/:id", getProductById);

// Tạo sản phẩm (Chỉ admin)
router.post("/", protect, isAdmin, createProduct);

// Cập nhật sản phẩm (Chỉ admin)
router.put("/:id", protect, isAdmin, updateProduct);

// Xóa sản phẩm (Chỉ admin)
router.delete("/:id", protect, isAdmin, deleteProduct);

export default router;
