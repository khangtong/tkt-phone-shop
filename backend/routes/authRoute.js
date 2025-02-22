import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// Route đăng ký
router.post("/register", registerUser);

// Route đăng nhập
router.post("/login", loginUser);

export default router;
