import Variation from "../models/variationModel.js";
import Product from "../models/productModel.js";

// Tạo một biến thể mới
export const createVariation = async (req, res) => {
  try {
    const newVariation = new Variation(req.body);
    const savedVariation = await newVariation.save();
    res.status(201).json(savedVariation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách biến thể
export const getAllVariations = async (req, res) => {
  try {
    const variations = await Variation.find();
    // .populate("discount");
    res.status(200).json(variations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy biến thể theo ID
export const getVariationById = async (req, res) => {
  try {
    const variation = await Variation.findById(req.params.id);
    // .populate("discount"    );
    if (!variation)
      return res.status(404).json({ message: "Variation not found" });
    res.status(200).json(variation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật biến thể
export const updateVariation = async (req, res) => {
  try {
    const updatedVariation = await Variation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedVariation)
      return res.status(404).json({ message: "Variation not found" });
    res.status(200).json(updatedVariation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa biến thể và xóa khỏi sản phẩm liên quan
export const deleteVariation = async (req, res) => {
  try {
    const variationId = req.params.id;
    const deletedVariation = await Variation.findByIdAndDelete(variationId);
    if (!deletedVariation)
      return res.status(404).json({ message: "Variation not found" });

    await Product.updateMany(
      { variation: variationId },
      { $pull: { variation: variationId } }
    );

    res.status(200).json({ message: "Variation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
