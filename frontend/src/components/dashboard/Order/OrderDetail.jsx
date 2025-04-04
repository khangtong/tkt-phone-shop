import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

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
          throw new Error("Failed to fetch order");
        }

        const result = await response.json();
        if (result.success) {
          setOrder(result.data);
        } else {
          throw new Error("Order data not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "delivery":
        return "bg-blue-100 text-blue-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Đang xử lý";
      case "delivery":
        return "Đang giao";
      case "success":
        return "Hoàn tất";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`/api/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update order status");
      }

      const updatedResponse = await fetch(`/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!updatedResponse.ok) {
        throw new Error("Failed to fetch updated order");
      }

      const updatedData = await updatedResponse.json();
      setOrder(updatedData.data);
      setStatusDropdownOpen(false);
      alert(`Đã cập nhật trạng thái thành: ${getStatusText(newStatus)}`);
    } catch (err) {
      console.error("Error updating order status:", err);
      alert(`Lỗi khi cập nhật trạng thái: ${err.message}`);
    }
  };

  const statusOptions = [
    { value: "Pending", label: "Đang xử lý" },
    { value: "Delivery", label: "Đang giao" },
    { value: "Success", label: "Hoàn tất" },
    { value: "Cancelled", label: "Đã hủy" },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Đang tải chi tiết đơn hàng...</p>
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

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Không tìm thấy đơn hàng</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" />
          Quay lại
        </button>
        <h1 className="text-2xl font-bold mt-4">
          Mã đơn hàng #{order._id.substring(0, 10)}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-4/5">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">STT</th>
                    <th className="px-4 py-3 text-left">Tên sản phẩm</th>
                    <th className="px-4 py-3 text-left">Màu sắc</th>
                    <th className="px-4 py-3 text-left">Phiên bản (RAM/ROM)</th>
                    <th className="px-4 py-3 text-left">Số lượng</th>
                    <th className="px-4 py-3 text-left">Đơn giá</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderDetails.map((item, index) => {
                    console.log("Full item data:", item);
                    console.log("Variation data:", item.variationId);
                    return (
                      <tr key={item._id} className="border-t">
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">
                          {item.productId?.name || "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          {item.variationId?.color || "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          {item.variationId?.ram && item.variationId?.rom
                            ? `${item.variationId.ram}GB/${item.variationId.rom}GB`
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3">{item.quantity || 0}</td>
                        <td className="px-4 py-3">
                          {item.priceAtPurchase
                            ? formatCurrency(item.priceAtPurchase) + "đ"
                            : "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-50 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">
                Thông tin khách hàng
              </h2>
              <p className="mb-2">
                Tên khách hàng: {order.userId?.name || "N/A"}
              </p>
              <p>Điện thoại: {order.userId?.phone || "N/A"}</p>
            </div>

            <div className="bg-slate-50 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">
                Thông tin giao hàng
              </h2>
              <p className="mb-2">Địa chỉ: {order.delivery_address || "N/A"}</p>
              <p className="mb-2">
                Phương thức thanh toán: {order.paymentMethod || "N/A"}
              </p>
              <p>
                Ngày đặt hàng:{" "}
                {order.orderDate ? formatDate(order.orderDate) : "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Tổng thanh toán</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tổng giá trị đơn hàng:</span>
                <span>{formatCurrency(order.total || 0)}đ</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/5">
          <div className="bg-slate-50 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Trạng thái đơn hàng</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  Trạng thái hiện tại
                </p>
                <div className="relative">
                  <button
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    className={`w-full p-2 rounded text-left flex justify-between items-center ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                    <svg
                      className={`w-4 h-4 ml-2 transition-transform ${
                        statusDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {statusDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(option.value)}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                            order.status === option.value
                              ? "bg-gray-100 font-medium"
                              : ""
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày đặt hàng</p>
                <p className="font-medium">
                  {order.orderDate ? formatDate(order.orderDate) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mã đơn hàng</p>
                <p className="font-medium">
                  #{order._id.substring(0, 10) || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
