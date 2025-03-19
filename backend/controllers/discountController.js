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
			message: 'Tạo mã giảm giá thành công',
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
			discounts,
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
			discount,
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
			message: 'Cập nhật mã giảm giá thành công',
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
		await Variation.updateMany({ discount: req.params.id }, { $set: { discount: null } });

		res.status(200).json({ message: 'Xóa giảm giá thành công!' });
	} catch (error) {
		res.status(500).json({ message: 'Lỗi server', error: error.message });
	}
};

export const addDiscountToVariation = async (req, res) => {
	try {
		const { discountId, variationIds } = req.body;

		if (!variationIds || !Array.isArray(variationIds) || variationIds.length === 0) {
			return res.status(400).json({ message: 'Danh sách ID biến thể không hợp lệ' });
		}

		const updates = await Promise.all(
			variationIds.map((id) =>
				Variation.findByIdAndUpdate(
					id,
					{ $set: { discount: discountId } },
					{ new: true },
				).populate('discount'),
			),
		);

		res.status(200).json({ message: 'Cập nhật thành công', variations: updates });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteDiscountFromVariation = async (req, res) => {
	try {
		const { variationId } = req.body;
		const variation = await Variation.findById(variationId);

		if (!variation) {
			return res.status(404).json({ message: 'Không tìm thấy biến thể.' });
		}

		variation.discount = null;
		await variation.save();

		return res.status(200).json({ message: 'Đã gỡ mã giảm giá khỏi biến thể thành công.' });
	} catch (error) {
		res.status(500).json({ message: 'Lỗi server', error: error.message });
	}
};
