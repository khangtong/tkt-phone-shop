import cartDetailModel from '../models/cartDetailModel.js';
import Variation from '../models/variationModel.js';
import Cart from '../models/cartModel.js';

// Create a new cart detail entry
export const createCartDetail = async (req, res) => {
  try {
    const { cart, variation, quantity } = req.body;
    const cartData = await Cart.findById(cart);
    const variationData = await Variation.findById(variation);

    if (!cartData) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (!variationData) {
      return res.status(404).json({ message: 'Variation not found' });
    }

    if (variationData.stock < quantity) {
      return res
        .status(400)
        .json({ message: 'This variation is not enough stock' });
    }

    const newCartDetail = await cartDetailModel.create({
      cart,
      variation,
      quantity,
    });
    res.status(201).json(newCartDetail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a cart detail by its ID
export const getCartDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const cartDetail = await cartDetailModel
      .findById(id)
      .populate('cart')
      .populate('variation');
    if (!cartDetail) {
      return res.status(404).json({ message: 'Cart detail not found' });
    }
    res.status(200).json(cartDetail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a cart detail by its ID
export const updateCartDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { cart, variation, quantity } = req.body;
    const cartData = await Cart.findById(cart);
    const variationData = await Variation.findById(variation);

    if (!cartData) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (!variationData) {
      return res.status(404).json({ message: 'Variation not found' });
    }

    if (variationData.stock < quantity) {
      return res
        .status(400)
        .json({ message: 'This variation is not enough stock' });
    }

    const updatedCartDetail = await cartDetailModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedCartDetail) {
      return res.status(404).json({ message: 'Cart detail not found' });
    }

    res.status(200).json(updatedCartDetail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a cart detail by its ID
export const deleteCartDetail = async (req, res) => {
  try {
    const cartDetail = await cartDetailModel.findById(req.params.id).populate({
      path: 'variation',
      populate: { path: 'discount' },
    });
    if (!cartDetail) {
      return res.status(404).json({ message: 'Cart detail not found' });
    }

    const cart = await Cart.findById(cartDetail.cart);
    if (cart) {
      cart.totalPrice -=
        cartDetail.quantity *
        (cartDetail.variation.discount &&
        cartDetail.variation.discount.endDate >= new Date()
          ? Math.round(
              cartDetail.variation.price *
                (1 - cartDetail.variation.discount.amount / 100)
            )
          : cartDetail.variation.price);

      cart.totalQuantity -= cartDetail.quantity;

      cart.cartDetails = cart.cartDetails.filter(
        (cartDetailId) => cartDetailId.toString() !== req.params.id
      );

      await cart.save();
    }

    await cartDetailModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Cart detail deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all cart details
export const getAllCartDetails = async (req, res) => {
  try {
    const cartDetails = await cartDetailModel
      .find()
      .populate('cart')
      .populate('variation');
    res.status(200).json(cartDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
