// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import Sidebar from "../../Sidebar";
// import { FaSearch, FaEye, FaEdit, FaTrash } from "react-icons/fa";
// import { useSelector } from "react-redux";
// import CustomModalConfirm from "../../CustomModal";

// export default function OrderDashboard() {
//   const [activeTab, setActiveTab] = useState("orders");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [orders, setOrders] = useState([]);
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const { currentUser } = useSelector((state) => state.user);
//   const [toast, setToast] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 8;
//   const [openModal, setOpenModal] = useState(false);
//   const [orderIdToDelete, setOrderIdToDelete] = useState(null);
//   const [statusFilter, setStatusFilter] = useState("all");

//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch("/api/orders", {
//         headers: {
//           Authorization: `Bearer ${currentUser.token}`,
//         },
//       });
//       if (!response.ok) throw new Error("Lỗi khi lấy đơn hàng");
//       const data = await response.json();
//       setOrders(data);
//       setFilteredOrders(data);
//     } catch (error) {
//       console.error(error);
//       setToast({ type: "error", message: "Lỗi khi tải đơn hàng" });
//       setTimeout(() => setToast(null), 3000);
//     }
//     setLoading(false);
//   };

//   const handleDeleteOrder = async (orderId) => {
//     try {
//       const res = await fetch(`/api/orders/${orderId}`, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${currentUser.token}`,
//         },
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         setToast({ type: "error", message: errorData.message });
//         return;
//       }

//       setOrders((prev) => prev.filter((order) => order._id !== orderId));
//       setFilteredOrders((prev) =>
//         prev.filter((order) => order._id !== orderId)
//       );
//       setToast({ type: "success", message: "Xóa đơn hàng thành công!" });
//       setOpenModal(false);
//       setTimeout(() => setToast(null), 3000);
//     } catch (error) {
//       setToast({ type: "error", message: "Lỗi khi xóa đơn hàng." });
//     }
//   };

//   const updateOrderStatus = async (orderId, newStatus) => {
//     try {
//       const res = await fetch(`/api/orders/${orderId}/status`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${currentUser.token}`,
//         },
//         body: JSON.stringify({ status: newStatus }),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         setToast({ type: "error", message: errorData.message });
//         return;
//       }

//       const updatedOrder = await res.json();
//       setOrders((prev) =>
//         prev.map((order) =>
//           order._id === orderId
//             ? { ...order, status: updatedOrder.status }
//             : order
//         )
//       );
//       setFilteredOrders((prev) =>
//         prev.map((order) =>
//           order._id === orderId
//             ? { ...order, status: updatedOrder.status }
//             : order
//         )
//       );
//       setToast({ type: "success", message: "Cập nhật trạng thái thành công!" });
//       setTimeout(() => setToast(null), 3000);
//     } catch (error) {
//       setToast({ type: "error", message: "Lỗi khi cập nhật trạng thái." });
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   useEffect(() => {
//     let result = orders;

//     // Apply status filter
//     if (statusFilter !== "all") {
//       result = result.filter((order) => order.status === statusFilter);
//     }

//     // Apply search filter
//     if (searchTerm) {
//       result = result.filter(
//         (order) =>
//           order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           order.userId?.name
//             ?.toLowerCase()
//             .includes(searchTerm.toLowerCase()) ||
//           order.delivery_address
//             .toLowerCase()
//             .includes(searchTerm.toLowerCase())
//       );
//     }

//     setFilteredOrders(result);
//     setCurrentPage(1);
//   }, [searchTerm, statusFilter, orders]);

//   const formatDate = (dateString) => {
//     const options = { year: "numeric", month: "long", day: "numeric" };
//     return new Date(dateString).toLocaleDateString("vi-VN", options);
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat("vi-VN", {
//       style: "currency",
//       currency: "VND",
//     }).format(amount);
//   };

//   const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
//   const currentOrders = filteredOrders.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const goToPage = (page) => {
//     setCurrentPage(page);
//   };

//   const statusOptions = [
//     { value: "all", label: "Tất cả" },
//     { value: "Pending", label: "Chờ xử lý" },
//     { value: "Delivery", label: "Đang giao" },
//     { value: "Success", label: "Hoàn thành" },
//   ];

//   return (
//     <div className="flex h-screen bg-gray-100">
//       <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

//       <div className="w-4/5 p-6">
//         <div className="bg-white p-6 rounded-xl shadow-lg">
//           {toast && (
//             <div
//               className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white ${
//                 toast.type === "success" ? "bg-green-500" : "bg-red-500"
//               }`}
//             >
//               {toast.message}
//             </div>
//           )}

//           <div className="flex justify-between items-center mb-4">
//             <div className="relative w-1/3">
//               <input
//                 type="text"
//                 placeholder="Tìm kiếm đơn hàng..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full p-2 pl-10 border rounded-lg"
//               />
//               <FaSearch className="absolute left-3 top-3 text-gray-400" />
//             </div>

//             <div className="flex items-center space-x-4">
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="p-2 border rounded-lg"
//               >
//                 {statusOptions.map((option) => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             {loading ? (
//               <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
//             ) : (
//               <table className="w-full border-collapse bg-white">
//                 <thead>
//                   <tr className="bg-gray-200 text-left">
//                     <th className="p-3">STT</th>
//                     <th className="p-3">Mã đơn hàng</th>
//                     <th className="p-3">Khách hàng</th>
//                     <th className="p-3">Tổng tiền</th>
//                     <th className="p-3">Ngày đặt</th>
//                     <th className="p-3">Địa chỉ giao</th>
//                     <th className="p-3">Phương thức TT</th>
//                     <th className="p-3">Trạng thái</th>
//                     <th className="p-3">Hành động</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredOrders.length > 0 ? (
//                     currentOrders.map((order, index) => (
//                       <tr key={order._id} className="border-t">
//                         <td className="p-3">
//                           {(currentPage - 1) * itemsPerPage + index + 1}
//                         </td>
//                         <td className="p-3">{order._id.substring(0, 8)}...</td>
//                         <td className="p-3">
//                           {order.userId?.name || "Khách vãng lai"}
//                         </td>
//                         <td className="p-3">{formatCurrency(order.total)}</td>
//                         <td className="p-3">{formatDate(order.orderDate)}</td>
//                         <td className="p-3">{order.delivery_address}</td>
//                         <td className="p-3">{order.paymentMethod}</td>
//                         <td className="p-3">
//                           <select
//                             value={order.status}
//                             onChange={(e) =>
//                               updateOrderStatus(order._id, e.target.value)
//                             }
//                             className={`p-1 rounded ${
//                               order.status === "Pending"
//                                 ? "bg-yellow-100 text-yellow-800"
//                                 : order.status === "Delivery"
//                                 ? "bg-blue-100 text-blue-800"
//                                 : "bg-green-100 text-green-800"
//                             }`}
//                           >
//                             <option value="Pending">Chờ xử lý</option>
//                             <option value="Delivery">Đang giao</option>
//                             <option value="Success">Hoàn thành</option>
//                           </select>
//                         </td>
//                         <td className="p-3 flex space-x-2">
//                           <Link to={`/admin/dashboard/order/${order._id}`}>
//                             <button className="bg-blue-500 p-2 text-white rounded-lg">
//                               <FaEye />
//                             </button>
//                           </Link>
//                           <button
//                             className="bg-red-500 p-2 text-white rounded-lg"
//                             onClick={() => {
//                               setOpenModal(true);
//                               setOrderIdToDelete(order._id);
//                             }}
//                           >
//                             <FaTrash />
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="9" className="text-center p-4 text-gray-500">
//                         Không tìm thấy đơn hàng nào.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             )}

//             {filteredOrders.length > 0 && (
//               <div className="flex justify-center mt-6">
//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                   (page) => (
//                     <button
//                       key={page}
//                       onClick={() => goToPage(page)}
//                       className={`mx-1 px-4 py-2 rounded-lg ${
//                         currentPage === page
//                           ? "bg-blue-600 text-white"
//                           : "bg-gray-200 text-gray-700"
//                       }`}
//                     >
//                       {page}
//                     </button>
//                   )
//                 )}
//               </div>
//             )}
//           </div>

//           <CustomModalConfirm
//             openModal={openModal}
//             onClose={() => setOpenModal(false)}
//             textConfirm={"Bạn chắc chắn muốn xoá đơn hàng này?"}
//             performAction={() => handleDeleteOrder(orderIdToDelete)}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
import React from "react";

export default function Orderdashboard() {
  return <div>Orderdashboard</div>;
}
