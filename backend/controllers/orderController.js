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
const getOrderById = async (req, res) => {
  try {
    // Lấy thông tin đơn hàng chính
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email phone"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Lấy tất cả order details liên quan đến đơn hàng này
    const orderDetails = await OrderDetail.find({ orderId: order._id })
      .populate("productId", "name images price")
      .populate("variationId", "ram rom size color");

    // Tạo response object kết hợp thông tin
    const response = {
      _id: order._id,
      userId: order.userId,
      total: order.total,
      delivery_address: order.delivery_address,
      orderDate: order.orderDate,
      paymentMethod: order.paymentMethod,
      status: order.status,
      contactPhone: order.contactPhone,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      orderDetails: orderDetails,
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//
const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderDetails = await OrderDetail.find({ orderId: order._id })
      .populate("productId", "name")
      .populate("variationId");

    res.json({
      orderDetails,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Hàm hủy đơn hàng (cho user)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Kiểm tra quyền user
    if (order.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Không có quyền hủy đơn hàng này" });
    }

    // Sử dụng method cancelOrder đã định nghĩa trong model
    const cancelledOrder = await order.cancelOrder();

    res.status(200).json({
      success: true,
      message: "Hủy đơn hàng thành công và đã hoàn trả số lượng tồn kho",
      data: cancelledOrder,
    });
  } catch (error) {
    console.error("Lỗi khi hủy đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi khi hủy đơn hàng",
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
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
