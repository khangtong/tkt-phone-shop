import mongoose from 'mongoose';

const cartDetailSchema = new mongoose.Schema({
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cart',
    required: true,
  },
  variation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'variation',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
});

const cartDetailModel = mongoose.model('cartDetail', cartDetailSchema);
export default cartDetailModel;
