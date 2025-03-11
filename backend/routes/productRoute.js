import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  addVariationToProduct,
  deleteProduct,
  updateProduct,
  searchProducts,
} from "../controllers/productController.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, isAdmin, createProduct);
router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/:id", getProductById);
router.put("/:id", protect, isAdmin, updateProduct);
router.post("/:id/add-variation", protect, isAdmin, addVariationToProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);

export default router;
