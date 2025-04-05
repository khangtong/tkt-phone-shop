import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../Sidebar";
import { FaSearch, FaEye, FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import CustomModalConfirm from "../../CustomModal";
import { Toast } from "flowbite-react";
import { HiCheck, HiX } from "react-icons/hi";

export default function OrderDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [openModal, setOpenModal] = useState(false);
  const [orderIdToDelete, setOrderIdToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // State quản lý toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Tự động ẩn toast sau 3 giây
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Hàm hiển thị toast
  const showToastMessage = (type, message) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      if (!response.ok) throw new Error("Lỗi khi lấy đơn hàng");
      const data = await response.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error(error);
      showToastMessage("error", "Lỗi khi tải đơn hàng");
    }
    setLoading(false);
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      console.log("Deleting order:", orderId);

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
      });

      const data = await res.json();
      console.log("Delete response:", data);

      if (!res.ok) {
        throw new Error(data.message || `HTTP error! status: ${res.status}`);
      }

      setOrders((prev) => prev.filter((order) => order._id !== orderId));
      setFilteredOrders((prev) =>
        prev.filter((order) => order._id !== orderId)
      );

      showToastMessage("success", data.message || "Xóa đơn hàng tất công");
    } catch (error) {
      console.error("Delete failed:", {
        error: error.message,
        stack: error.stack,
        orderId,
      });
      showToastMessage("error", error.message || "Lỗi khi xóa đơn hàng");
    } finally {
      setOpenModal(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        showToastMessage("error", errorData.message);
        return;
      }

      const updatedOrder = await res.json();
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? { ...order, status: updatedOrder.status }
            : order
        )
      );
      setFilteredOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? { ...order, status: updatedOrder.status }
            : order
        )
      );

      const statusMessages = {
        Pending: "Đơn hàng đã được chuyển về trạng thái Chờ xử lý",
        Delivery: "Đơn hàng đang được giao",
        Success: "Đơn hàng đã hoàn tất",
        Cancelled: "Đơn hàng đã được hủy",
      };

      showToastMessage(
        "success",
        statusMessages[updatedOrder.status] || "Cập nhật trạng thái tất công!"
      );
    } catch (error) {
      showToastMessage("error", "Lỗi khi cập nhật trạng thái.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const getStatusText = (status) => {
    switch (status) {
      case "Pending":
        return "Chờ xử lý";
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

  useEffect(() => {
    let result = orders;

    // Lọc theo trạng thái
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      result = result.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.userId?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.delivery_address
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, orders]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const statusOptions = [
    { value: "all", label: "Tất cả" },
    { value: "Pending", label: "Chờ xử lý" },
    { value: "Delivery", label: "Đang giao" },
    { value: "Success", label: "Hoàn tất" },
    { value: "Cancelled", label: "Đã hủy" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {showToast && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 mt-5 z-50">
          <Toast>
            <div
              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                toastType === "success"
                  ? "bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200"
                  : "bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200"
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

      <div className="w-4/5 p-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-10 border rounded-lg"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border rounded-lg"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
            ) : (
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-200 text-left">
                    <th className="p-3">STT</th>
                    <th className="p-3">Mã đơn hàng</th>
                    <th className="p-3">Khách hàng</th>
                    <th className="p-3">Tổng tiền</th>
                    <th className="p-3">Ngày đặt</th>
                    <th className="p-3">Địa chỉ giao</th>
                    <th className="p-3">Phương thức TT</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    currentOrders.map((order, index) => (
                      <tr key={order._id} className="border-t">
                        <td className="p-3">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="p-3">{order._id.substring(0, 10)}</td>
                        <td className="p-3">
                          {order.userId?.name || "Khách vãng lai"}
                        </td>
                        <td className="p-3">{formatCurrency(order.total)}</td>
                        <td className="p-3">{formatDate(order.orderDate)}</td>
                        <td className="p-3">
                          {order.delivery_address.substring(0, 10)}...
                        </td>
                        <td className="p-3">{order.paymentMethod}</td>
                        <td className="p-3">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(order._id, e.target.value)
                            }
                            className={`p-1 rounded ${
                              order.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "Delivery"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "Success"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            <option value="Pending">Chờ xử lý</option>
                            <option value="Delivery">Đang giao</option>
                            <option value="Success">Hoàn tất</option>
                            <option value="Cancelled">Đã hủy</option>
                          </select>
                        </td>
                        <td className="p-3 flex space-x-2">
                          <Link
                            to={`/admin/dashboard/order/orderdetail/${order._id}`}
                          >
                            <button className="bg-blue-500 p-2 text-white rounded-lg">
                              <FaEye />
                            </button>
                          </Link>
                          <button
                            className="bg-red-500 p-2 text-white rounded-lg"
                            onClick={() => {
                              setOpenModal(true);
                              setOrderIdToDelete(order._id);
                            }}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center p-4 text-gray-500">
                        Không tìm thấy đơn hàng nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {filteredOrders.length > 0 && (
              <div className="flex justify-center mt-6">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`mx-1 px-4 py-2 rounded-lg ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <CustomModalConfirm
            openModal={openModal}
            onClose={() => setOpenModal(false)}
            textConfirm={"Bạn chắc chắn muốn xoá đơn hàng này?"}
            performAction={() => handleDeleteOrder(orderIdToDelete)}
          />
        </div>
      </div>
    </div>
  );
}
