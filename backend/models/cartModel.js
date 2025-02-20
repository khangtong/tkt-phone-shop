import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user',
	},
	totalPrice: {
		type: Number,
		default: 0,
		required: true,
	},
	totalQuantity: {
		type: Number,
		default: 0,
		required: true,
	},
});

const cartModel = mongoose.model('cart', cartSchema);
export default cartModel;
