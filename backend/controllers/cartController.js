import jwt from "jsonwebtoken";

import Cart from "../models/cartModel.js";
import Variation from "../models/variationModel.js";
import CartDetail from "../models/cartDetailModel.js";

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
    const carts = await Cart.find()
      .populate("userId")
      .populate({
        path: "cartDetails",
        populate: {
          path: "variation",
          populate: [{ path: "product" }, { path: "discount" }],
        },
      });
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
      .populate({
        path: "cartDetails",
        populate: {
          path: "variation",
          populate: [{ path: "product" }, { path: "discount" }],
        },
      });

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
      .populate({
        path: "cartDetails",
        populate: {
          path: "variation",
          populate: [{ path: "product" }, { path: "discount" }],
        },
      });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addVariationToCart = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const cart = await Cart.findOne({ userId: decoded.id }).populate(
      "cartDetails"
    );
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const variation = await Variation.findById(req.body._id);
    if (!variation)
      return res.status(404).json({ message: "Variation not found" });

    if (variation.stock < 1) {
      return res
        .status(400)
        .json({ message: "This variation is out of stock" });
    }

    const cartDetail = await CartDetail.findOne({
      cart: cart._id,
      variation: variation._id,
    });

    if (cartDetail) {
      cartDetail.quantity += 1;
      await cartDetail.save();
    } else {
      const newCartDetail = new CartDetail({
        cart: cart._id,
        variation: variation._id,
        quantity: 1,
      });
      await newCartDetail.save();
      cart.cartDetails.push(newCartDetail._id);
    }

    cart.totalPrice += req.body.price;
    cart.totalQuantity += 1;
    const updatedCart = await cart.save();
    res.status(200).json(updatedCart);
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

    const newCart = {};
    newCart.userId = decoded.id;
    const cartDetails = await CartDetail.find({ cart: cart._id }).populate({
      path: "variation",
      populate: { path: "discount" },
    });
    newCart.cartDetails = cartDetails;

    newCart.totalPrice = cartDetails.reduce((acc, item) => {
      if (
        item.variation.discount &&
        item.variation.discount.endDate >= new Date()
      ) {
        return (
          acc +
          Math.round(
            item.variation.price *
              (1 - item.variation.discount.amount / 100) *
              item.quantity
          )
        );
      }
      return acc + item.variation.price * item.quantity;
    }, 0);

    newCart.totalQuantity = cartDetails.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    const updatedCart = await Cart.findByIdAndUpdate(cart._id, newCart, {
      new: true,
    });

    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCart = async (req, res) => {
  try {
    const cart = await Cart.findByIdAndDelete(req.params.id);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    await CartDetail.deleteMany({ cart: cart._id });
    res.status(200).json({ message: "Cart has been deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
