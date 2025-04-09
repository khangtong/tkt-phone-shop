import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';
import Variation from '../models/variationModel.js';

export const createCategory = async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: 'Category not found' });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const { name, logo } = req.body;
  const categoryId = req.params.id;

  try {
    const category = await Category.findById(categoryId);

    if (!category)
      return res.status(404).json({ message: 'Category not found' });

    category.name = name || category.name;
    category.logo = logo || category.logo;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findByIdAndDelete(categoryId);

    if (!category)
      return res.status(404).json({ message: 'Category not found' });

    // Delete all products associated with this category
    const products = await Product.find({ category: categoryId });

    for (const product of products) {
      await Variation.deleteMany({ product: product._id });
    }

    await Product.deleteMany({ category: categoryId });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
