import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  total: {
    type: Number,
    required: true,
  },
  delivery_address: {
    type: String,
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  status: { type: mongoose.Schema.Types.ObjectId, ref: "orderStatus" },
});
const orderModel = mongoose.model("order", orderSchema);
export default orderModel;
