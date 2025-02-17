import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  totalPrice: {
    type: Number,
    default: 0,
    required: true,
  },
  totalQuantity: {
    type: Number,
    default: 0,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
});

const cartModel = mongoose.model('cart', cartSchema);
export default cartModel;
