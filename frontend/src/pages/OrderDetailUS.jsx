import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { HiCheck, HiX } from "react-icons/hi";
import { Toast } from "flowbite-react";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const showToastMessage = (type, message) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
  };

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
        console.error("Error fetching order:", err);
        setError(err.message);
        showToastMessage("error", "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Format date to Vietnamese format
  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  // Format currency to VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Get color class based on order status
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "text-yellow-500";
      case "Delivery":
        return "text-blue-500";
      case "Success":
        return "text-green-500";
      case "Cancelled":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  // Get Vietnamese text for order status
  const getStatusText = (status) => {
    switch (status) {
      case "Pending":
        return "Đang xử lý";
      case "Delivery":
        return "Đang giao";
      case "Success":
        return "Hoàn tất";
      case "Cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 text-lg mb-4">Lỗi: {error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Quay lại
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 bg-white min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg mb-4">Không tìm thấy đơn hàng</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Quay lại
        </button>
      </div>
    );
  }
  const handleCancelOrder = async (orderId) => {
    try {
      if (!orderId) {
        throw new Error("Không tìm thấy ID đơn hàng");
      }

      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Hủy đơn thất bại");
      }

      // Cập nhật UI
      setOrder((prev) => ({
        ...prev,
        status: "Cancelled",
      }));

      showToastMessage("success", "Hủy đơn hàng thành công");
      navigate("/profile/order");
    } catch (error) {
      console.error("Hủy đơn thất bại:", error);
      showToastMessage("error", error.message || "Lỗi khi hủy đơn hàng");
    }
  };
  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast>
            <div
              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                toastType === "success"
                  ? "bg-green-100 text-green-500"
                  : "bg-red-100 text-red-500"
              }`}
            >
              {toastType === "success" ? (
                <HiCheck className="h-5 w-5" />
              ) : (
                <HiX className="h-5 w-5" />
              )}
            </div>
            <div className="ml-3 text-sm font-normal">{toastMessage}</div>
            <Toast.Toggle onDismiss={() => setShowToast(false)} />
          </Toast>
        </div>
      )}

      {/* Header with back button */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <FaArrowLeft className="text-2xl mr-2" />
          <span className="text-lg">Quay lại</span>
        </button>
        <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
      </div>

      {/* Order info header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Mã đơn hàng: #{order._id.substring(0, 10)}
        </h2>
        <span className={`text-lg font-medium ${getStatusColor(order.status)}`}>
          ● {getStatusText(order.status)}
        </span>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer and delivery info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div className="bg-white p-4 rounded shadow-sm">
              <h3 className="font-bold text-lg mb-2">Thông tin khách hàng</h3>
              <p className="mb-1">
                <span className="font-medium">Tên:</span>{" "}
                {order.userId?.name || order.customerName || "N/A"}
              </p>
              <p className="mb-1">
                <span className="font-medium">Email:</span>{" "}
                {order.userId?.email || order.customerEmail || "N/A"}
              </p>
              <p>
                <span className="font-medium">Điện thoại:</span>{" "}
                {order.userId?.phone || order.contactPhone || "N/A"}
              </p>
            </div>

            <div className="bg-white p-4 rounded shadow-sm">
              <h3 className="font-bold text-lg mb-2">Thông tin giao hàng</h3>
              <p className="mb-1">
                <span className="font-medium">Địa chỉ:</span>{" "}
                {order.delivery_address || "N/A"}
              </p>
              <p className="mb-1">
                <span className="font-medium">Ngày đặt:</span>{" "}
                {order.orderDate ? formatDate(order.orderDate) : "N/A"}
              </p>
              {order.deliveredAt && (
                <p>
                  <span className="font-medium">Ngày giao:</span>{" "}
                  {formatDate(order.deliveredAt)}
                </p>
              )}
            </div>
          </div>

          {/* Products table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <h3 className="font-bold text-lg p-4 border-b">Sản phẩm đã đặt</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">STT</th>
                    <th className="p-3 text-left">Sản phẩm</th>
                    <th className="p-3 text-left">Cấu hình</th>
                    <th className="p-3 text-left">Màu sắc</th>
                    <th className="p-3 text-center">Số lượng</th>
                    <th className="p-3 text-right">Đơn giá</th>
                    <th className="p-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderDetails.map((item, index) => (
                    <tr key={item._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center">
                          {item.productId?.images?.[0] && (
                            <img
                              src={item.productId.images[0]}
                              alt={item.productId.name}
                              className="w-12 h-12 object-contain mr-2"
                            />
                          )}
                          <Link to={`/product/${item.productId._id}`}>
                            {" "}
                            <span className="text-gray-700 hover:text-blue-600 ">
                              {item.productId?.name || "N/A"}
                            </span>
                          </Link>
                        </div>
                      </td>
                      <td className="p-3">
                        {item.variationId?.ram && item.variationId?.rom
                          ? `${item.variationId.ram}GB/${item.variationId.rom}GB`
                          : "N/A"}
                      </td>
                      <td className="p-3">
                        {item.variationId?.color || "N/A"}
                      </td>
                      <td className="p-3 text-center">{item.quantity || 0}</td>
                      <td className="p-3 text-right">
                        {formatCurrency(item.priceAtPurchase)}
                      </td>
                      <td className="p-3 text-right font-medium">
                        {formatCurrency(item.priceAtPurchase * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column - 1/3 width */}
        <div className="space-y-6">
          {/* Payment info */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-bold text-lg mb-3">Thông tin thanh toán</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tổng giá sản phẩm:</span>
                <span>
                  {formatCurrency(
                    order.orderDetails.reduce(
                      (sum, item) => sum + item.priceAtPurchase * item.quantity,
                      0
                    )
                  )}
                </span>
              </div>

              <hr className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng thanh toán:</span>
                <span className="text-red-600">
                  {formatCurrency(order.total)}
                </span>
              </div>
              <hr className="my-2" />
              <div>
                <p className="font-medium">Phương thức thanh toán:</p>
                <p className="capitalize">{order.paymentMethod || "N/A"}</p>
              </div>
              {order.paymentStatus && (
                <div className="mt-2">
                  <p className="font-medium">Trạng thái thanh toán:</p>
                  <p className="capitalize">{order.paymentStatus}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order actions */}
          {order.status === "Pending" && (
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="font-bold text-lg mb-3">Thao tác</h3>
              <button
                onClick={() => {
                  if (window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) {
                    handleCancelOrder(order._id); // Truyền trực tiếp order._id
                  }
                }}
                className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Hủy đơn hàng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
