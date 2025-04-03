import orderDetailModel from "../models/orderDetailModel.js";

// Create new order detail
const createOrderDetail = async (req, res) => {
  try {
    const {
      orderId,
      productId,
      variationId,
      quantity,
      priceAtPurchase,
      discountAtPurchase,
    } = req.body;

    const newOrderDetail = await orderDetailModel.create({
      orderId,
      productId,
      variationId,
      quantity,
      priceAtPurchase,
      discountAtPurchase,
    });

    res.status(201).json({
      success: true,
      message: "Order detail created successfully",
      data: newOrderDetail,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create order detail",
      error: error.message,
    });
  }
};

// Get order details by order ID
const getOrderDetailsByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderDetails = await orderDetailModel
      .find({ orderId })
      .populate("productId")
      .populate("variationId");

    res.status(200).json({
      success: true,
      message: "Order details retrieved successfully",
      data: orderDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order details",
      error: error.message,
    });
  }
};

// Update order detail
const updateOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedOrderDetail = await orderDetailModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedOrderDetail) {
      return res.status(404).json({
        success: false,
        message: "Order detail not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order detail updated successfully",
      data: updatedOrderDetail,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update order detail",
      error: error.message,
    });
  }
};

// Delete order detail
const deleteOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrderDetail = await orderDetailModel.findByIdAndDelete(id);

    if (!deletedOrderDetail) {
      return res.status(404).json({
        success: false,
        message: "Order detail not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order detail deleted successfully",
      data: deletedOrderDetail,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete order detail",
      error: error.message,
    });
  }
};

export default {
  createOrderDetail,
  getOrderDetailsByOrderId,
  updateOrderDetail,
  deleteOrderDetail,
};
