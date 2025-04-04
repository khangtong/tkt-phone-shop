import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaSearch, FaEye } from "react-icons/fa";
import { HiCheck, HiX } from "react-icons/hi";
import { Toast } from "flowbite-react";
import CustomModalConfirm from "../components/CustomModal";

const OrderList = () => {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [openModal, setOpenModal] = useState(false);
  const [orderIdToCancel, setOrderIdToCancel] = useState(null);

  const tabs = ["Tất cả", "Đang xử lý", "Đang giao", "Hoàn tất", "Đã hủy"];

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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();

      // Fetch detailed product information for each order
      const ordersWithDetails = await Promise.all(
        data.map(async (order) => {
          try {
            const detailsResponse = await fetch(`/api/orders/${order._id}`, {
              headers: {
                Authorization: `Bearer ${currentUser.token}`,
              },
            });
            if (!detailsResponse.ok)
              throw new Error("Failed to fetch order details");
            const orderDetails = await detailsResponse.json();

            return {
              ...order,
              products: orderDetails.data.orderDetails.map((detail) => ({
                name: detail.productId?.name || "Product not available",
                color: detail.variationId?.color || "N/A",
                ram: detail.variationId?.ram || "N/A",
                rom: detail.variationId?.rom || "N/A",
                quantity: detail.quantity || 0,
                price: detail.priceAtPurchase || 0,
                image: detail.productId?.images?.[0] || null,
              })),
            };
          } catch (error) {
            console.error(
              `Error fetching details for order ${order._id}:`,
              error
            );
            return {
              ...order,
              products: [{ name: "Failed to load product information" }],
            };
          }
        })
      );

      setOrders(ordersWithDetails);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showToastMessage("error", "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  // Cancel order function
  const handleCancelOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderIdToCancel}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      // Update UI
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderIdToCancel
            ? { ...order, status: "Cancelled" }
            : order
        )
      );

      showToastMessage("success", "Order cancelled successfully");
    } catch (error) {
      console.error("Cancel failed:", error);
      showToastMessage("error", error.message || "Failed to cancel order");
    } finally {
      setOpenModal(false);
    }
  };

  // Filter orders by tab and search term
  useEffect(() => {
    let result = [...orders];

    // Filter by tab
    if (activeTab !== "Tất cả") {
      const statusMap = {
        "Đang xử lý": "Pending",
        "Đang giao": "Delivery",
        "Hoàn tất": "Success",
        "Đã hủy": "Cancelled",
      };
      result = result.filter((order) => order.status === statusMap[activeTab]);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (order) =>
          order._id.toLowerCase().includes(term) ||
          order.delivery_address.toLowerCase().includes(term) ||
          order.paymentMethod.toLowerCase().includes(term) ||
          order.products.some((product) =>
            product.name.toLowerCase().includes(term)
          )
      );
    }

    // Calculate total amount
    const calculatedTotal = result.reduce((sum, order) => sum + order.total, 0);
    setTotalAmount(calculatedTotal);

    setFilteredOrders(result);
  }, [activeTab, searchTerm, orders]);

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
        return "bg-yellow-100 text-yellow-800";
      case "Delivery":
        return "bg-blue-100 text-blue-800";
      case "Success":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Đơn hàng của tôi</h1>

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

      {/* Order status tabs */}
      <div className="flex border-b overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap ${
              activeTab === tab
                ? "border-b-2 border-red-500 text-red-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative my-4">
        <input
          type="text"
          placeholder="Tìm kiếm đơn hàng theo mã, địa chỉ hoặc tên sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 pl-10 border rounded-lg focus:ring-2 "
        />
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
      </div>

      {/* Order summary */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Tìm thấy {filteredOrders.length} đơn hàng
        </div>
        <div className="text-lg font-bold text-red-600">
          Tổng tiền: {formatCurrency(totalAmount)}
        </div>
      </div>

      {/* Orders list */}
      <div className="bg-white p-4 mt-4 rounded-lg shadow-md">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Không có đơn hàng nào phù hợp
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      Mã đơn hàng: {order._id.substring(0, 10)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Ngày đặt: {formatDate(order.orderDate)}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>

                {/* Products list */}
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Sản phẩm:
                  </p>
                  <div className="space-y-3">
                    {order.products?.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 border-b pb-3 last:border-b-0"
                      >
                        {product.image && (
                          <div className="w-16 h-16 flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-contain rounded"
                            />
                          </div>
                        )}
                        <p className="font-medium">{product.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order summary */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                    <p className="font-medium">{order.delivery_address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Phương thức thanh toán
                    </p>
                    <p className="font-medium">{order.paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Tổng tiền</p>
                    <p className="font-bold text-red-600">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-4 flex justify-end space-x-2">
                  <Link
                    to={`/profile/order/${order._id}`}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                  >
                    <FaEye className="mr-1" /> Chi tiết
                  </Link>

                  {order.status === "Pending" && (
                    <button
                      onClick={() => {
                        setOrderIdToCancel(order._id);
                        setOpenModal(true);
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Hủy đơn
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel confirmation modal */}
      <CustomModalConfirm
        openModal={openModal}
        onClose={() => setOpenModal(false)}
        textConfirm="Bạn chắc chắn muốn hủy đơn hàng này?"
        performAction={handleCancelOrder}
      />
    </div>
  );
};

export default OrderList;
