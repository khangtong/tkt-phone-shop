import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/orders//my-orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = () => {
    switch (activeTab) {
      case "processing":
        return orders.filter((order) => order.status === "processing");
      case "shipping":
        return orders.filter((order) => order.status === "shipping");
      case "completed":
        return orders.filter((order) => order.status === "completed");
      case "cancelled":
        return orders.filter((order) => order.status === "cancelled");

      default:
        return orders;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipping":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "returned":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel order");
      }

      // Refresh orders after cancellation
      const updatedResponse = await fetch("/api/orders/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!updatedResponse.ok) {
        throw new Error("Failed to fetch updated orders");
      }

      const updatedData = await updatedResponse.json();
      setOrders(updatedData);
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <p>Lỗi: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6 overflow-x-auto">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "all"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("all")}
        >
          Tất cả
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "processing"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("processing")}
        >
          Đang xử lý
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "shipping"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("shipping")}
        >
          Đang giao
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "completed"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("completed")}
        >
          Hoàn tất
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "cancelled"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("cancelled")}
        >
          Đã hủy
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders().length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Không có đơn hàng nào</p>
          </div>
        ) : (
          filteredOrders().map((order) => (
            <div
              key={order._id}
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              {/* Order Header */}
              <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b">
                <div>
                  <span className="text-sm text-gray-500">Ngày đặt: </span>
                  <span className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span className="mx-2">|</span>
                  <span className="text-sm text-gray-500">Mã đơn: </span>
                  <span className="font-medium">{order._id}</span>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status === "processing" && "Đang xử lý"}
                  {order.status === "shipping" && "Đang giao"}
                  {order.status === "completed" && "Hoàn tất"}
                  {order.status === "cancelled" && "Đã hủy"}
                  {order.status === "returned" && "Trả hàng"}
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4">
                <div className="mb-3">
                  <span className="text-sm text-gray-500">
                    Phương thức nhận hàng:{" "}
                  </span>
                  <span className="font-medium">
                    {order.shippingMethod === "pickup"
                      ? "Nhận tại Shop"
                      : "Giao hàng"}
                  </span>
                </div>

                {order.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between py-3 border-b last:border-b-0"
                  >
                    <div className="flex space-x-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {item.price.toLocaleString()}đ
                      </p>
                      {item.originalPrice && (
                        <p className="text-sm text-gray-500 line-through">
                          {item.originalPrice.toLocaleString()}đ
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Order Summary */}
                <div className="mt-4 pt-4 border-t flex justify-end">
                  <div className="text-right space-y-2">
                    <div className="flex justify-between w-64">
                      <span className="text-gray-600">Tạm tính:</span>
                      <span>
                        {order.items
                          .reduce(
                            (sum, item) => sum + item.price * item.quantity,
                            0
                          )
                          .toLocaleString()}
                        đ
                      </span>
                    </div>
                    <div className="flex justify-between w-64">
                      <span className="text-gray-600">Phí vận chuyển:</span>
                      <span>{order.shippingFee.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between w-64 font-bold text-lg">
                      <span>Tổng cộng:</span>
                      <span className="text-blue-600">
                        {(
                          order.items.reduce(
                            (sum, item) => sum + item.price * item.quantity,
                            0
                          ) + order.shippingFee
                        ).toLocaleString()}
                        đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3">
                {order.status === "processing" && (
                  <button
                    className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50"
                    onClick={() => handleCancelOrder(order._id)}
                  >
                    Hủy đơn hàng
                  </button>
                )}
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Order;
