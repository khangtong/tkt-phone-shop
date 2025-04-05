import Payment from "../models/paymentModel.js";
import Cart from "../models/cartModel.js";
import jwt from "jsonwebtoken";
import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from "vnpay";
import dotenv from "dotenv";

dotenv.config();

export const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate("orderId")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy lịch sử thanh toán" });
  }
};
export const handleVNPayPayment = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Không có token xác thực" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    // Tìm giỏ hàng của user
    const cart = await Cart.findOne({ userId: decoded.id });
    if (!cart)
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    if (cart.totalPrice <= 0) {
      return res
        .status(400)
        .json({ message: "Giỏ hàng không hợp lệ để thanh toán" });
    }
    const existingPayment = await Payment.findOne({
      cartId: cart._id,
      paymentStatus: "Đang xử lý",
    });

    if (existingPayment) {
      return res
        .status(400)
        .json({ message: "Đơn hàng này đã có giao dịch đang xử lý" });
    }

    // Khởi tạo VNPAY
    const vnpay = new VNPay({
      tmnCode: process.env.VNP_TMNCODE,
      secureSecret: process.env.VNP_HASH_SECRET,
      vnpayHost: "https://sandbox.vnpayment.vn",
      testMode: true,
      hashAlgorithm: "SHA512",
      enableLog: true,
      loggerFn: ignoreLogger,
    });

    // Tính thời gian hết hạn (24h sau)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Tạo URL thanh toán từ VNPAY
    const vnpayResponse = await vnpay.buildPaymentUrl({
      vnp_Amount: cart.totalPrice, // VNPay yêu cầu số tiền nhân 100
      vnp_IpAddr: req.ip || "127.0.0.1",
      vnp_TxnRef: cart._id.toString(), // Định danh đơn hàng duy nhất
      vnp_OrderInfo: `Thanh toán đơn hàng #${cart._id}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: process.env.VNP_RETURN_URL,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });

    // Lưu thông tin thanh toán vào database
    const newPayment = await Payment.create({
      userId: decoded.id,
      cartId: cart._id,
      totalAmount: cart.totalPrice,
      paymentMethod: "VNPay",
      paymentStatus: "Đang xử lý", // Mặc định
    });

    return res.status(201).json({
      success: true,
      paymentId: newPayment._id,
      vnpayUrl: vnpayResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tạo thanh toán",
      error: error.message,
    });
  }
};

export const handleVNPayReturn = async (req, res) => {
  try {
    const { vnp_ResponseCode, vnp_TxnRef, vnp_TransactionNo, vnp_PayDate } =
      req.query;

    // Tìm payment dựa trên cartId (vnp_TxnRef)
    const payment = await Payment.findOne({ cartId: vnp_TxnRef });

    if (!payment) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    }

    if (vnp_ResponseCode === "00") {
      // Cập nhật trạng thái khi thanh toán thành công
      payment.transactionId = vnp_TransactionNo; // Lưu mã giao dịch VNPAY
      payment.paymentDate = vnp_PayDate;
      payment.paymentStatus = "Thành công";
      await payment.save();

      // Xoá giỏ hàng sau khi thanh toán thành công
      await Cart.deleteOne({ _id: vnp_TxnRef });

      // Chuyển hướng người dùng đến trang thành công
      return res.redirect(
        `${process.env.CLIENT_URL}/payment-success/${payment._id}`
      );

      // return res.json({
      // 	success: true,
      // 	message: 'Thanh toán thành công',
      // 	paymentId: payment._id,
      // });
    } else {
      // Cập nhật trạng thái khi thanh toán thất bại
      payment.paymentStatus = "Thất bại";
      await payment.save();

      return res.redirect(
        `${process.env.CLIENT_URL}/payment-failed/${payment._id}`
      );

      // return res.json({
      // 	success: false,
      // 	message: 'Thanh toán thất bại',
      // 	paymentId: payment._id,
      // });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi xử lý thanh toán", error: error.message });
  }
};

export const handleCODPayment = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Không có token xác thực" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    // Tìm giỏ hàng của user
    const cart = await Cart.findOne({ userId: decoded.id });
    if (!cart)
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    if (cart.totalPrice <= 0) {
      return res
        .status(400)
        .json({ message: "Giỏ hàng không hợp lệ để thanh toán" });
    }

    // Kiểm tra nếu đơn hàng đã có giao dịch đang xử lý
    const existingPayment = await Payment.findOne({
      cartId: cart._id,
      paymentStatus: "Đang xử lý",
    });
    if (existingPayment) {
      return res
        .status(400)
        .json({ message: "Đơn hàng này đã có giao dịch đang xử lý" });
    }

    // Tạo đơn hàng với COD
    const newPayment = await Payment.create({
      userId: decoded.id,
      cartId: cart._id,
      totalAmount: cart.totalPrice,
      paymentMethod: "COD",
      paymentStatus: "Thành công", // COD mặc định là thành công
    });

    // Xóa giỏ hàng sau khi đơn hàng được xác nhận
    await Cart.deleteOne({ _id: cart._id });

    return res.status(201).json({
      success: true,
      paymentId: newPayment._id,
      message: "Thanh toán COD thành công!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xử lý thanh toán COD",
      error: error.message,
    });
  }
};
