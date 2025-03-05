import OrderDetail from "../models/orderDetailModel.js";

//  Lấy danh sách chi tiết đơn hàng theo orderId
export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderDetails = await OrderDetail.find({ orderId })
      .populate("productId")
      .populate("cartId");

    if (!orderDetails.length)
      return res.status(404).json({ message: "Order details not found" });

    res.status(200).json(orderDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Xóa một chi tiết đơn hàng
export const deleteOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const orderDetail = await OrderDetail.findById(id);
    if (!orderDetail)
      return res.status(404).json({ message: "Order detail not found" });

    await orderDetail.deleteOne();

    res.status(200).json({ message: "Order detail has been deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
