import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
	{
		cartId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'cart',
			required: true,
		},
		amount: {
			type: Number,
			required: true,
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
