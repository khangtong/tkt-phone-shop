import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  HiArrowLeft,
  HiCalendar,
  HiCheck,
  HiReceiptTax,
  HiTruck,
  HiX,
} from "react-icons/hi";
// import { toast } from "react-toastify";

const OrderDetailPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Không thể tải chi tiết đơn hàng");
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const getStatusInfo = (status) => {
    switch (status) {
      case "Pending":
        return {
          color: "bg-yellow-100 text-yellow-800",
          text: "Đang chờ xử lý",
          icon: <HiCalendar className="mr-1" />,
        };
      case "Delivery":
        return {
          color: "bg-blue-100 text-blue-800",
          text: "Đang giao hàng",
          icon: <HiTruck className="mr-1" />,
        };
      case "Success":
        return {
          color: "bg-green-100 text-green-800",
          text: "Giao hàng thành công",
          icon: <HiCheck className="mr-1" />,
        };
      case "Cancelled":
        return {
          color: "bg-red-100 text-red-800",
          text: "Đã hủy",
          icon: <HiX className="mr-1" />,
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          text: status,
          icon: <HiReceiptTax className="mr-1" />,
        };
    }
  };

  const formatDate = (dateString) => {
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Đang tải chi tiết đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20 text-red-500">
          <p>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <p className="text-gray-500">Không tìm thấy đơn hàng</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <HiArrowLeft className="mr-1" /> Quay lại
        </button>
        <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
      </div>

      {/* Thông tin chung */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Thông tin đơn hàng</h3>
            <div className="space-y-1">
              <p>
                <span className="text-gray-600">Mã đơn hàng:</span> {order._id}
              </p>
              <p>
                <span className="text-gray-600">Ngày đặt:</span>{" "}
                {formatDate(order.orderDate)}
              </p>
              <p>
                <span className="text-gray-600">Trạng thái:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-sm ${
                    getStatusInfo(order.status).color
                  }`}
                >
                  {getStatusInfo(order.status).icon}
                  {getStatusInfo(order.status).text}
                </span>
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Thông tin thanh toán</h3>
            <div className="space-y-1">
              <p>
                <span className="text-gray-600">Phương thức:</span>{" "}
                {order.paymentMethod === "COD"
                  ? "Tiền mặt khi nhận hàng"
                  : "VNPay"}
              </p>
              <p>
                <span className="text-gray-600">Địa chỉ giao hàng:</span>{" "}
                {order.delivery_address}
              </p>
            </div>
          </div>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="bg-gray-100 p-5 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-4">Chi tiết sản phẩm</h2>
          <ul className="space-y-3">
            {order.items?.length > 0 ? (
              order.items.map((item, index) => {
                const discountValid =
                  item.discount &&
                  new Date(item.discount.startDate) <= new Date() &&
                  new Date(item.discount.endDate) >= new Date();

                const discountedPrice = discountValid
                  ? Math.round(
                      item.priceAtPurchase * (1 - item.discount.amount / 100)
                    )
                  : item.priceAtPurchase;

                return (
                  <li
                    key={index}
                    className="flex justify-between items-center pb-3 border-b last:border-b-0"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                        <img
                          src={
                            item.productId?.image || "/placeholder-product.jpg"
                          }
                          alt={item.productId?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{item.productId?.name}</p>
                        <p className="text-sm text-gray-500">
                          Số lượng: {item.quantity}
                        </p>
                        {discountValid && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded mt-1 inline-block">
                            Giảm {item.discount.amount}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {discountedPrice.toLocaleString()}₫
                      </p>
                      {discountValid && (
                        <p className="text-sm text-gray-500 line-through">
                          {item.priceAtPurchase.toLocaleString()}₫
                        </p>
                      )}
                    </div>
                  </li>
                );
              })
            ) : (
              <p className="text-center text-gray-500">Không có sản phẩm</p>
            )}
          </ul>

          <div className="mt-6 pt-4 border-t space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Tạm tính:</span>
              <span>
                {order.items
                  .reduce((sum, item) => {
                    const discountValid =
                      item.discount &&
                      new Date(item.discount.startDate) <= new Date() &&
                      new Date(item.discount.endDate) >= new Date();
                    const price = discountValid
                      ? Math.round(
                          item.priceAtPurchase *
                            (1 - item.discount.amount / 100)
                        )
                      : item.priceAtPurchase;
                    return sum + price * item.quantity;
                  }, 0)
                  .toLocaleString()}
                ₫
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Phí vận chuyển:</span>
              <span>0₫</span>
            </div>

            <div className="flex justify-between font-bold text-lg pt-2">
              <span>Tổng cộng:</span>
              <span className="text-red-600">
                {order.total.toLocaleString()}₫
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex justify-end space-x-3">
        {order.status === "Pending" && (
          <button
            className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50"
            onClick={() => {
              if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
                // Gọi API hủy đơn hàng
                toast.success("Đã gửi yêu cầu hủy đơn hàng");
              }
            }}
          >
            Hủy đơn hàng
          </button>
        )}
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => navigate("/orders")}
        >
          Quay lại danh sách
        </button>
      </div>
    </div>
  );
};

export default OrderDetailPage;
