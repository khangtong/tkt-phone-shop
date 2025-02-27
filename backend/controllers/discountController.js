import Discount from '../models/discountModel.js';
import Variation from '../models/variationModel.js';

export const createDiscount = async (req, res) => {
	try {
		const { name, amount, startDate, endDate } = req.body;

		if (!name || !amount || !startDate || !endDate) {
			return res.status(400).json({
				message: 'name, amount, startDate, endDate must be provided',
			});
		}

		const discount = await Discount.create({ name, amount, startDate, endDate });

		return res.status(201).json({
			message: 'Discount created successfully',
			data: discount,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: 'Server error',
			error: error.message,
		});
	}
};

export const getAllDiscounts = async (req, res) => {
	try {
		const discounts = await Discount.find();

		return res.status(201).json({
			message: 'Get all discounts',
			data: discounts,
		});
	} catch (error) {
		res.status(500).json({
			message: 'Server error',
			error: error.message,
		});
	}
};

export const getDiscountById = async (req, res) => {
	try {
		const discount = await Discount.findById(req.params.id);

		if (!discount) {
			return res.status(404).json({
				message: 'Discount not found',
			});
		}

		return res.status(201).json({
			message: 'Get discount by id',
			data: discount,
		});
	} catch (error) {
		res.status(500).json({
			message: 'Server error',
			error: error.message,
		});
	}
};

export const updateDiscount = async (req, res) => {
	try {
		const { name, amount, startDate, endDate } = req.body;
		const discount = await Discount.findByIdAndUpdate(
			req.params.id,
			{
				...(name && { name }),
				...(amount && { amount }),
				...(startDate && { startDate }),
				...(endDate && { endDate }),
			},
			{ new: true },
		);

		if (!discount) {
			return res.status(404).json({
				message: 'Discount not found',
			});
		}

		res.status(200).json({
			message: 'Update discount successfully',
			data: discount,
		});
	} catch (error) {
		res.status(500).json({
			message: 'Server error',
			error: error.message,
		});
	}
};

export const deleteDiscount = async (req, res) => {
	try {
		const discount = await Discount.findByIdAndDelete(req.params.id);
		if (!discount) {
			return res.status(404).json({ message: 'Không tìm thấy giảm giá' });
		}

		// Xóa giảm giá trong biến thể liên quan
		await Variation.updateOne({ discount: req.params.id }, { $unset: { discount: '' } });

		res.status(200).json({ message: 'Xóa giảm giá thành công!' });
	} catch (error) {
		res.status(500).json({ message: 'Lỗi server', error: error.message });
	}
};

export const addDiscountToVariation = async (req, res) => {
	try {
		const { id } = req.params;
		const { discountId } = req.body;

		const variation = await Variation.findById(id);

		if (!variation) {
			return res.status(404).json({ message: 'Variation not found' });
		}

		const addDiscount = await Variation.findByIdAndUpdate(
			id,
			{ $set: { discount: discountId } },
			{ new: true },
		).populate('discount');

		res.status(200).json(addDiscount);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
