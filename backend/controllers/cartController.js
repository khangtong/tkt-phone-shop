import jwt from "jsonwebtoken";

import Cart from "../models/cartModel.js";
import Variation from "../models/variationModel.js";

export const createCart = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = decoded.id;

    const cart = await Cart.findOne({ userId: decoded.id });
    if (cart)
      return res
        .status(400)
        .json({ message: "Cart can only create once per user" });

    const newCart = new Cart(req.body);
    const savedCart = await newCart.save();
    res.status(201).json(savedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find().populate("userId").populate("variation");
    res.status(200).json(carts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCartByUserId = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const cart = await Cart.findOne({ userId: decoded.id })
      .populate("userId")
      .populate("variation");
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCartById = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id)
      .populate("userId")
      .populate("variation");
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCart = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const cart = await Cart.findOne({ userId: decoded.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const { variation, totalPrice, totalQuantity } = req.body;

    cart.variation = variation || cart.variation;
    cart.totalPrice = totalPrice || cart.totalPrice;
    cart.totalQuantity = totalQuantity || cart.totalQuantity;
    const updatedCart = await cart.save();
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    await cart.delete();
    res.status(200).json({ message: "Cart has been deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
