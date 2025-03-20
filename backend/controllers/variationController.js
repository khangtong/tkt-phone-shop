import Variation from "../models/variationModel.js";
import Product from "../models/productModel.js";

// Tạo biến thể mới và cập nhật vào sản phẩm
export const createVariation = async (req, res) => {
  try {
    const { price, color, ram, rom, stock, discount, productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const newVariation = new Variation({
      price,
      color,
      ram,
      rom,
      stock,
      discount,
      product: productId,
    });
    const savedVariation = await newVariation.save();

    await Product.findByIdAndUpdate(productId, {
      $push: { variation: savedVariation._id },
    });

    res.status(201).json(savedVariation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả biến thể, kèm theo tên sản phẩm
export const getAllVariations = async (req, res) => {
  try {
    const variations = await Variation.find()

      .populate("product", "name image") // Chỉ lấy trường "name" của product
      .populate("discount", "amount startDate endDate"); // Chỉ lấy các trường cần thiết của discount

    res.status(200).json(variations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy một biến thể theo ID
export const getVariationById = async (req, res) => {
  try {
    const variation = await Variation.findById(req.params.id)
      .populate("product", "name")
      .populate("discount", "amount startDate endDate");

    if (!variation) {
      return res.status(404).json({ message: "Variation not found" });
    }

    res.status(200).json(variation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin biến thể
export const updateVariation = async (req, res) => {
  try {
    const { price, color, ram, rom, stock, discount } = req.body;

    const updatedVariation = await Variation.findByIdAndUpdate(
      req.params.id,
      { price, color, ram, rom, stock, discount },
      { new: true }
    ).populate("product", "name");

    if (!updatedVariation)
      return res.status(404).json({ message: "Variation not found" });

    res.status(200).json(updatedVariation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa biến thể và cập nhật sản phẩm liên quan
export const deleteVariation = async (req, res) => {
  try {
    const variationId = req.params.id;

    const deletedVariation = await Variation.findByIdAndDelete(variationId);
    if (!deletedVariation)
      return res.status(404).json({ message: "Variation not found" });

    await Product.findByIdAndUpdate(deletedVariation.product, {
      $pull: { variation: variationId },
    });

    res.status(200).json({ message: "Variation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
