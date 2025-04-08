import Order from "../models/orderModel.js";
import OrderDetail from "../models/orderDetailModel.js";
import Category from "../models/categoryModel.js";

export const getStatistics = async (req, res) => {
  try {
    const { start, end } = req.query;

    let orders;

    if (new Date(start).getTime() == new Date(end).getTime()) {
      orders = await Order.find({
        orderDate: {
          $gte: new Date(start),
        },
        status: { $eq: "Success" },
      });
    } else if (new Date(start).getTime() > new Date(end).getTime()) {
      return res.status(400).json({ message: "Khoảng thời gian không hợp lệ" });
    } else {
      orders = await Order.find({
        $and: [
          {
            orderDate: {
              $gte: new Date(start),
            },
          },
          {
            orderDate: {
              $lte: new Date(end),
            },
          },
        ],
        status: { $eq: "Success" },
      });
    }

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        message: "Không có hóa đơn để thống kê trong khoảng thời gian này",
      });
    }

    const pipeline = [
      {
        $match: {
          orderId: { $in: orders.map((o) => o._id) },
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "order",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category",
              },
            },
          ],
          as: "product",
        },
      },
      {
        $lookup: {
          from: "variations",
          localField: "variationId",
          foreignField: "_id",
          as: "variation",
        },
      },
    ];

    const orderDetails = await OrderDetail.aggregate(pipeline);
    const categories = await Category.find({});

    const statistic = {
      totalRevenue: orders.reduce((acc, order) => acc + order.total, 0),
      totalOrders: orders.length,
    };

    statistic.revenueOnCategory = categories.map((category) => {
      const categoryOrders = orderDetails.filter(
        (detail) =>
          detail.product[0].category[0]._id.toString() ===
          category._id.toString()
      );
      return {
        category: category.name,
        totalRevenue: categoryOrders.reduce(
          (acc, order) => acc + order.priceAtPurchase * order.quantity,
          0
        ),
      };
    });

    res.status(200).json(statistic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
