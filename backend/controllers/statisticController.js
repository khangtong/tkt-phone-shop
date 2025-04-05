import Order from '../models/orderModel.js';
import OrderDetail from '../models/orderDetailModel.js';

export const getStatistics = async (req, res) => {
  try {
    const { start, end } = req.body;

    const orders = await Order.find({
      orderDate: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
    });
    console.log(orders);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }

    const pipeline = [
      { $in: orders.map((order) => order._id) },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $lookup: {
          from: 'carts',
          localField: 'cartId',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'cartDetails',
                localField: 'cartDetails',
                foreignField: '_id',
                pipeline: [
                  {
                    $lookup: {
                      from: 'variations',
                      localField: 'variation',
                      foreignField: '_id',
                      pipeline: [
                        {
                          $lookup: {
                            from: 'discounts',
                            localField: 'discount',
                            foreignField: '_id',
                            as: 'discount',
                          },
                        },
                      ],
                      as: 'variation',
                    },
                  },
                ],
                as: 'cartDetail',
              },
            },
          ],
          as: 'cart',
        },
      },
    ];

    const orderDetails = await OrderDetail.aggregate(pipeline);
    res.status(200).json(orderDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
