import Payment from '../models/paymentModel.js';
import Cart from '../models/cartModefl.js';
import jwt from 'jsonwebtoken';
import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from 'vnpay';
import dotenv from 'dotenv';
dotenv.config();

export const createPayment = async (req, res) => {
	try {
		// Lấy token từ request header
		const token = req.headers.authorization?.split(' ')[1];
		if (!token) return res.status(401).json({ message: 'Không có token xác thực' });

		// Giải mã token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded) return res.status(401).json({ message: 'Token không hợp lệ' });

		// Tìm giỏ hàng của user
		const cart = await Cart.findOne({ userId: decoded.id });
		if (!cart) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });

		// Khởi tạo VNPAY
		const vnpay = new VNPay({
			tmnCode: process.env.VNP_TMNCODE,
			secureSecret: process.env.VNP_HASH_SECRET,
			vnpayHost: 'https://sandbox.vnpayment.vn',
			testMode: true,
			hashAlgorithm: 'SHA512',
			enableLog: true,
			loggerFn: ignoreLogger,
		});

		// Tính thời gian hết hạn (24h sau)
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);

		// Tạo URL thanh toán từ VNPAY
		const vnpayResponse = await vnpay.buildPaymentUrl({
			vnp_Amount: cart.totalPrice * 100, // VNPay yêu cầu số tiền nhân 100
			vnp_IpAddr: req.ip || '127.0.0.1',
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
			cartId: cart._id,
			amount: cart.totalPrice,
			paymentStatus: 'Đang xử lý',
		});

		return res.status(201).json({
			success: true,
			paymentId: newPayment._id,
			vnpayUrl: vnpayResponse,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'Lỗi khi tạo thanh toán',
			error: error.message,
		});
	}
};

export const paymentCallback = async (req, res) => {
	try {
		const { vnp_ResponseCode, vnp_TxnRef } = req.query;

		// Kiểm tra mã phản hồi từ VNPAY
		if (vnp_ResponseCode === '00') {
			// Tìm thanh toán trong database
			const payment = await Payment.findOne({ cartId: vnp_TxnRef });

			if (!payment) {
				return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
			}

			// Cập nhật trạng thái thanh toán
			payment.paymentStatus = 'Thành công';
			await payment.save();

			// Trả về phản hồi thành công
			return res.redirect(
				`${process.env.CLIENT_URL}/checkout/success?paymentId=${payment._id}`,
			);
		} else {
			// Thanh toán thất bại
			await Payment.findOneAndUpdate({ cartId: vnp_TxnRef }, { paymentStatus: 'Thất bại' });
			return res.redirect(`${process.env.CLIENT_URL}/checkout/failure`);
		}
	} catch (error) {
		return res.status(500).json({ message: 'Lỗi xử lý thanh toán', error: error.message });
	}
};
