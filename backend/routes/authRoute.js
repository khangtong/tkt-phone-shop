import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route đăng ký
router.post("/register", registerUser);

// Route đăng nhập
router.post("/login", loginUser);

// Route đăng xuât
router.post("/logout", protect, logoutUser);

export default router;
