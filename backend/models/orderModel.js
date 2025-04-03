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
  status: {
    type: String,
    enum: ["Pending", "Delivery", "Success"],
    default: "Pending",
    required: true,
  },
});
orderSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      // Xóa tất cả order details liên quan khi xóa order
      await mongoose.model("orderDetail").deleteMany({ orderId: this._id });
      next();
    } catch (error) {
      next(error);
    }
  }
);
const orderModel = mongoose.model("order", orderSchema);
export default orderModel;
