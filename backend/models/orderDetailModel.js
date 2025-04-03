import mongoose from "mongoose";
const orderDetailSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    variationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "variation",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    // Thêm các trường mới KHÔNG ảnh hưởng đến orderModel
    priceAtPurchase: {
      // Lưu giá tại thời điểm mua
      type: Number,
      required: true,
    },

    discountAtPurchase: {
      // Nếu có giảm giá
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
); // Thêm thời gian tạo/cập nhật
const orderDetailModel = mongoose.model("orderDetail", orderDetailSchema);
export default orderDetailModel;
