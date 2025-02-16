import mongoose from "mongoose";
const orderDetailSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "order",
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
  },
  quantity: {
    type: Number,
    required: true,
  },
});
const orderDetailModel = mongoose.model("orderDetail", orderDetailSchema);
export default orderDetailModel;
