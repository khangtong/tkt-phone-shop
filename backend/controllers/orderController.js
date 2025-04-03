// orderController.js
import Order from "../models/orderModel.js";
import OrderDetail from "../models/orderDetailModel.js";
import Variation from "../models/variationModel.js";

// Controller tạo đơn hàng
const createOrder = async (req, res) => {
  try {
    const {
      delivery_address,
      paymentMethod,
      total,
      contactPhone,
      customerName,
      customerEmail,
    } = req.body;

    const order = new Order({
      userId: req.user._id,
      delivery_address,
      contactPhone,
      customerName,
      customerEmail,
      paymentMethod,
      total,
      status: "Pending",
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng" });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy đơn hàng" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    order.status = status;
    if (status === "Delivered") {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật đơn hàng" });
  }
};

// backend/controllers/orderController.js
const deleteOrder = async (req, res) => {
  try {
    // 1. Xóa tất cả order details trước
    await OrderDetail.deleteMany({ orderId: req.params.id });

    // 2. Xóa order chính
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.status(200).json({
      message: "Xóa đơn hàng thành công",
      deletedOrder,
    });
  } catch (error) {
    console.error("Lỗi xóa đơn hàng:", error);
    res.status(500).json({
      message: "Xóa đơn hàng không thành công",
      error: error.message,
    });
  }
};

export {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
  deleteOrder,
};
