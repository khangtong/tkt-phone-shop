import express from "express";
import {
  registerUser,
  loginUser,
  updateUser,
  logoutUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route đăng ký
router.post("/register", registerUser);

// Route đăng nhập
router.post("/login", loginUser);

// Route đăng xuât
router.post("/logout", protect, logoutUser);

//Route cập nhật
router.put("/update", protect, updateUser);

// Quên mật khẩu
router.put("/forgot-password", forgotPassword);

// Xác thực OTP
router.put("/verify-otp", verifyOTP);

// Đặt lại mật khẩu
router.put("/reset-password", resetPassword);

export default router;
