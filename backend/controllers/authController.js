import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import generateOTP from "../utils/generateOTP.js";
import forgotPasswordTemplate from "../utils/forgotPasswordTemplate.js";
import sendEmail from "../configs/sendEmail.js";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1m" });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      address,
      phone,
    });

    // Generate token
    const token = generateToken(newUser._id);

    // Send response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        // role: newUser.role,
        // token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    // Tìm user theo ID đã được xác thực từ token
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Xóa refresh token trong database
    user.refresh_token = "";
    await user.save();

    // Xóa cookie (nếu bạn đang sử dụng refresh token trong cookie)
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const updateUser = async (req, res) => {
  try {
    const userId = req.user._id; // Lấy ID người dùng từ middleware xác thực
    const { name, email, address, phone, password } = req.body;

    // Tìm người dùng hiện tại
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kiểm tra nếu email đã tồn tại trong hệ thống (trừ chính user hiện tại)
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email đã tồn tại" });
      }
      user.email = email;
    }

    // Cập nhật các thông tin khác nếu có
    if (name) user.name = name;
    if (address) user.address = address;
    if (phone) user.phone = phone;

    // Nếu có mật khẩu mới, hash lại mật khẩu
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Lưu lại thay đổi
    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Quên mật khẩu
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Vui lòng kiểm tra lại email",
      });
    }

    const otp = generateOTP();
    const expireTime = Date.now() + 1000 * 60 * 30; // 30 minutes

    const updateUser = await User.findByIdAndUpdate(
      user._id,
      {
        passwordResetOTP: otp,
        passwordResetExpires: expireTime,
      },
      { new: true }
    );

    const data = {
      to: email,
      subject: "TKT-Phone-Shop Verification Code",
      text: "Hey user",
      html: forgotPasswordTemplate({ name: user.name, otpCode: otp }),
    };

    await sendEmail(data);

    return res.status(200).json({
      message: "Kiểm tra email của bạn để đặt lại mật khẩu",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Xác nhận OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const currentTime = new Date();

    if (!email || !otp) {
      return res.status(400).json({
        message: "Provided email and otp code",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Vui lòng kiểm tra lại email",
      });
    }

    if (!user.passwordResetOTP || user.passwordResetOTP !== otp) {
      return res.status(400).json({
        message: "Mã xác nhận không hợp lệ hoặc đã hết hạn",
      });
    }

    if (!user.passwordResetExpires || user.passwordResetExpires < currentTime) {
      return res.status(400).json({
        message: "Mã xác nhận không hợp lệ hoặc đã hết hạn",
      });
    }

    const update = await User.findByIdAndUpdate(user._id, {
      passwordResetOTP: "",
      passwordResetExpires: null,
    });

    return res.status(200).json({
      message: "Xác thực thành công",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Đặt lại mật khẩu
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message:
          "Provided required fields email, newPassword and confirmPassword",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Mật khẩu mới và xác nhận mật khẩu không khớp",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const update = await User.findByIdAndUpdate(
      user._id,
      {
        password: hashedPassword,
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Đặt lại mật khẩu thành công",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
