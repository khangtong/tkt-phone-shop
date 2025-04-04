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
    enum: ["Pending", "Delivery", "Success", "Cancelled"],
    default: "Pending",
    required: true,
  },
});
orderSchema.methods.cancelOrder = async function () {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Chỉ cho phép hủy nếu đơn ở trạng thái Pending hoặc Processing
    if (!["Pending", "Processing"].includes(this.status)) {
      throw new Error(
        "Chỉ có thể hủy đơn hàng khi ở trạng thái Đang xử lý hoặc Đang chuẩn bị"
      );
    }

    // 2. Lấy tất cả order details
    const OrderDetail = mongoose.model("orderDetail");
    const orderDetails = await OrderDetail.find({ orderId: this._id }).session(
      session
    );

    // 3. Hoàn trả stock cho từng biến thể
    const Variation = mongoose.model("variation");
    for (const detail of orderDetails) {
      const variation = await Variation.findById(detail.variationId).session(
        session
      );
      if (variation) {
        variation.stock += detail.quantity;
        await variation.save({ session });
      }
    }

    // 4. Cập nhật trạng thái đơn hàng
    this.status = "Cancelled";
    this.cancelledAt = new Date();
    await this.save({ session });

    await session.commitTransaction();
    session.endSession();

    return this;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

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
