import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		startDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

const discountModel = mongoose.model('discount', discountSchema);

export default discountModel;
