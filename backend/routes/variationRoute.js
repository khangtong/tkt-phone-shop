import express from "express";
import {
  createVariation,
  getAllVariations,
  getVariationById,
  updateVariation,
  deleteVariation,
} from "../controllers/variationController.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, isAdmin, createVariation);
router.get("/", getAllVariations);
router.get("/:id", getVariationById);
router.put("/:id", protect, isAdmin, updateVariation);
router.delete("/:id", protect, isAdmin, deleteVariation);

export default router;
