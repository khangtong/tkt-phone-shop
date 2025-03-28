import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user',
			required: true,
		},
		cartId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'cart',
			required: true,
		},
		totalAmount: {
			type: Number,
			required: true,
		},
		paymentMethod: {
			type: String,
			required: true,
			enum: ['COD', 'VNPay'],
			default: 'COD',
		},
		paymentDate: {
			type: Date,
			default: null,
		},
		paymentStatus: {
			type: String,
			required: true,
			enum: ['Đang xử lý', 'Thành công', 'Thất bại', 'Hoàn trả'],
			default: 'Đang xử lý',
		},
	},
	{
		timestamps: true,
	},
);

const paymentModel = mongoose.model('payment', paymentSchema);
export default paymentModel;
