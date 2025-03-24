import mongoose from 'mongoose';

const cartDetailSchema = new mongoose.Schema({
	cart: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'cart',
		required: true,
	},
});

const cartModel = mongoose.model('cart', cartDetailSchema);
export default cartModel;
