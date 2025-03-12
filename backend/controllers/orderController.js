import Order from "../models/orderModel.js";
import OrderDetail from "../models/orderDetailModel.js";
import Cart from "../models/cartModel.js";
import jwt from "jsonwebtoken";

//  Tạo đơn hàng mới
export const createOrder = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { delivery_address, paymentMethod } = req.body;

    // Lấy giỏ hàng của user
    const cart = await Cart.findOne({ userId }).populate("variation");
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Tạo đơn hàng mới
    const newOrder = new Order({
      userId,
      total: cart.totalPrice,
      delivery_address,
      paymentMethod,
      status: "Pending",
    });

    const savedOrder = await newOrder.save();

    // Chuyển dữ liệu từ giỏ hàng sang OrderDetail
    for (let variation of cart.variation) {
      const orderDetail = new OrderDetail({
        orderId: savedOrder._id,
        productId: variation,
        cartId: cart._id,
        quantity: 1, // Hoặc lấy số lượng từ giỏ hàng
      });
      await orderDetail.save();
    }

    // Xóa giỏ hàng sau khi đặt hàng
    await Cart.findByIdAndDelete(cart._id);

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Lấy tất cả đơn hàng (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Lấy đơn hàng của user hiện tại
export const getUserOrders = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const orders = await Order.find({ userId }).populate("userId");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// //  Cập nhật trạng thái đơn hàng (Admin)
// export const updateOrderStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
//     const { id } = req.params;

//     const updatedOrder = await Order.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );

//     if (!updatedOrder)
//       return res.status(404).json({ message: "Order not found" });

//     res.status(200).json(updatedOrder);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

//  Xóa đơn hàng (Admin)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await OrderDetail.deleteMany({ orderId: id }); // Xóa chi tiết đơn hàng
    await order.deleteOne();

    res.status(200).json({ message: "Order has been deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
