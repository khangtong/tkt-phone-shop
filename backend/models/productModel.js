import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	image: {
		type: Array,
		required: true,
	},
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'category',
	},
	variation: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'variation',
		},
	],
});
const productModel = mongoose.model('product', productSchema);
export default productModel;
