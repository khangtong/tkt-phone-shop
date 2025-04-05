import orderDetailModel from "../models/orderDetailModel.js";
import variationModel from "../models/variationModel.js";
import mongoose from "mongoose";
import orderModel from "../models/orderModel.js";

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 100;

// Helper function to update order total
const updateOrderTotal = async (orderId, session = null) => {
  const options = session ? { session } : {};
  const orderDetails = await orderDetailModel.find({ orderId }, null, options);

  const total = orderDetails.reduce(
    (sum, detail) => sum + detail.priceAtPurchase * detail.quantity,
    0
  );

  await orderModel.findByIdAndUpdate(orderId, { total }, options);
};

// Create new order detail with retry logic
const createOrderDetail = async (req, res) => {
  let retryCount = 0;

  while (retryCount < MAX_RETRY_ATTEMPTS) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const {
        orderId,
        productId,
        variationId,
        quantity,
        priceAtPurchase,
        discountAtPurchase = 0,
      } = req.body;

      if (quantity <= 0 || !Number.isInteger(quantity)) {
        throw new Error("Số lượng phải là số nguyên dương");
      }

      // Check order exists
      const orderExists = await orderModel
        .exists({ _id: orderId })
        .session(session);
      if (!orderExists) {
        throw new Error(`Đơn hàng ${orderId} không tồn tại`);
      }

      // Update stock using atomic operation
      const updateResult = await variationModel.updateOne(
        {
          _id: variationId,
          stock: { $gte: quantity },
        },
        { $inc: { stock: -quantity } },
        { session }
      );

      if (updateResult.modifiedCount === 0) {
        const variation = await variationModel
          .findById(variationId)
          .session(session);
        if (!variation) {
          throw new Error(`Phiên bản sản phẩm không tồn tại`);
        }
        throw new Error(`Không đủ hàng. Chỉ còn ${variation.stock} sản phẩm`);
      }

      // Create order detail
      const newOrderDetail = await orderDetailModel.create(
        [
          {
            orderId,
            productId,
            variationId,
            quantity,
            priceAtPurchase,
            discountAtPurchase,
          },
        ],
        { session }
      );

      if (!newOrderDetail?.[0]) {
        throw new Error("Không thể tạo chi tiết đơn hàng");
      }

      // Update order total
      await updateOrderTotal(orderId, session);

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        success: true,
        message: "Tạo chi tiết đơn hàng thành công",
        data: newOrderDetail[0],
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      if (
        error.message.includes("Write conflict") &&
        retryCount < MAX_RETRY_ATTEMPTS - 1
      ) {
        retryCount++;
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1))
        );
        continue;
      }

      console.error(
        `Lỗi tạo chi tiết đơn hàng (attempt ${retryCount + 1}):`,
        error
      );
      return res.status(400).json({
        success: false,
        message: error.message || "Lỗi khi tạo chi tiết đơn hàng",
        retryAttempt: retryCount + 1,
      });
    }
  }
};
// Get order details by order ID (không thay đổi)
const getOrderDetailsByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Validate order exists
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    const orderDetails = await orderDetailModel
      .find({ orderId })
      .populate({
        path: "productId",
        select: "name price images",
      })
      .populate({
        path: "variationId",
        select: "name price ram rom color size",
      })
      .lean();

    const enrichedDetails = orderDetails.map((detail) => ({
      ...detail,
      subtotal:
        (detail.priceAtPurchase - detail.discountAtPurchase) * detail.quantity,
    }));

    res.status(200).json({
      success: true,
      message: "Order details retrieved successfully",
      data: enrichedDetails,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order details",
      error: error.message,
    });
  }
};

// Update order detail (thêm xử lý stock khi cập nhật quantity)
const updateOrderDetail = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent updating orderId or productId
    if (updateData.orderId || updateData.productId || updateData.variationId) {
      return res.status(400).json({
        success: false,
        message: "Cannot change orderId, productId or variationId",
      });
    }

    const orderDetail = await orderDetailModel.findById(id).session(session);
    if (!orderDetail) {
      return res.status(404).json({
        success: false,
        message: "Order detail not found",
      });
    }

    // Xử lý cập nhật số lượng
    if (updateData.quantity) {
      if (updateData.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be at least 1",
        });
      }

      const variation = await variationModel
        .findById(orderDetail.variationId)
        .session(session);
      const quantityDiff = updateData.quantity - orderDetail.quantity;

      // Kiểm tra stock
      if (variation.stock < quantityDiff) {
        throw new Error(
          `Không đủ hàng. Chỉ có thể thêm tối đa ${variation.stock} sản phẩm`
        );
      }

      // Cập nhật stock
      variation.stock -= quantityDiff;
      await variation.save({ session });
    }

    const updatedOrderDetail = await orderDetailModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true, session }
    );

    // Cập nhật tổng tiền đơn hàng
    await updateOrderTotal(orderDetail.orderId, session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Cập nhật đơn hàng thành công",
      data: updatedOrderDetail,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Lỗi cập nhật đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order detail",
      error: error.message,
    });
  }
};

// Delete order detail (thêm xử lý hoàn trả stock)
const deleteOrderDetail = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const orderDetail = await orderDetailModel.findById(id).session(session);
    if (!orderDetail) {
      return res.status(404).json({
        success: false,
        message: "Order detail not found",
      });
    }

    // Hoàn trả stock
    const variation = await variationModel
      .findById(orderDetail.variationId)
      .session(session);
    variation.stock += orderDetail.quantity;
    await variation.save({ session });

    const orderId = orderDetail.orderId;
    const deletedOrderDetail = await orderDetailModel.findByIdAndDelete(id, {
      session,
    });

    // Update order total after deletion
    await updateOrderTotal(orderId, session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Đơn hàng đã được xóa thành công",
      data: deletedOrderDetail,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Lỗi khi xóa chi tiết đơn hàng:", error);
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
  updateOrderTotal,
};
