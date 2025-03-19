import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import Sidebar from "../../Sidebar";
import { useSelector, useDispatch } from "react-redux";
import {
  getVariationsStart,
  getVariationsSuccess,
  getVariationsFailure,
  deleteVariationStart,
  deleteVariationSuccess,
  deleteVariationFailure,
} from "../../../redux/variation/variationSlice";
import { IoAddOutline } from "react-icons/io5";

export default function VariationDashboard() {
  const dispatch = useDispatch();
  const { variations, loading, error } = useSelector(
    (state) => state.variation
  );
  const { currentUser } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("variations");
  const [currentPage, setCurrentPage] = useState(1); // State để theo dõi trang hiện tại
  const [searchTerm, setSearchTerm] = useState(""); // State để lưu trữ từ khóa tìm kiếm
  const itemsPerPage = 8; // Số biến thể hiển thị trên mỗi trang

  // Hàm chuyển đổi ROM từ GB sang TB nếu lớn hơn 1000 GB
  const formatRom = (rom) => {
    if (rom >= 1000) {
      return `${(rom / 1024).toFixed(0)} TB`; // Chia cho 1024 và làm tròn 2 chữ số thập phân
    }
    return `${rom} GB`;
  };

  useEffect(() => {
    const fetchVariations = async () => {
      dispatch(getVariationsStart());
      try {
        const res = await fetch("/api/variations");
        if (!res.ok) throw new Error("Không thể lấy danh sách biến thể");
        const data = await res.json();
        console.log("Variations Data:", data); // Kiểm tra dữ liệu trả về

        // Không cần fetch thêm thông tin sản phẩm vì đã có sẵn trong data
        dispatch(getVariationsSuccess(data));
      } catch (error) {
        dispatch(getVariationsFailure(error.message));
      }
    };

    fetchVariations();
  }, [dispatch]);

  const handleDeleteVariation = async (variationId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa biến thể này?")) return;
    dispatch(deleteVariationStart());

    try {
      const res = await fetch(`/api/variations/${variationId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Lỗi khi xóa biến thể");
      }

      dispatch(deleteVariationSuccess(variationId));
    } catch (error) {
      dispatch(deleteVariationFailure(error.message));
    }
  };

  // Lọc biến thể dựa trên từ khóa tìm kiếm
  const filteredVariations = variations.filter((variation) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (variation.product?.name?.toLowerCase() || "").includes(searchLower) ||
      variation.color.toLowerCase().includes(searchLower) ||
      variation.ram.toString().includes(searchTerm) ||
      variation.rom.toString().includes(searchTerm) ||
      variation.price.toString().includes(searchTerm) ||
      variation.stock.toString().includes(searchTerm) ||
      (variation.discount &&
        variation.discount.name.toLowerCase().includes(searchLower))
    );
  });

  // Tính toán số trang dựa trên biến thể đã lọc
  const totalPages = Math.ceil(filteredVariations.length / itemsPerPage);

  // Lấy danh sách biến thể cho trang hiện tại
  const currentVariations = filteredVariations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Hàm chuyển trang
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="w-4/5 p-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-center">
            Quản lý biến thể
          </h2>
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Tìm kiếm variation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-10 border rounded-lg"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <Link to={"/admin/dashboard/variation/add"}>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
                <IoAddOutline className="mr-1 text-lg" />
                Thêm biến thể mới
              </button>
            </Link>
          </div>
          {loading ? (
            <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : filteredVariations.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white">
                  <thead>
                    <tr className="bg-gray-200 text-left">
                      <th className="p-3">STT</th>
                      <th className="p-3">Tên sản phẩm</th>
                      <th className="p-3">Giá</th>
                      <th className="p-3">Màu sắc</th>
                      <th className="p-3">RAM</th>
                      <th className="p-3">ROM</th>
                      <th className="p-3">Số lượng</th>
                      <th className="p-3">Giảm giá</th>
                      <th className="p-3">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentVariations.map((variation, index) => (
                      <tr key={variation._id} className="border-t">
                        <td className="p-3">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="p-3">
                          {variation.product?.name || "Không xác định"}
                        </td>
                        <td className="p-3">
                          {variation.price.toLocaleString("vi-VN")} VNĐ
                        </td>
                        <td className="p-3">{variation.color}</td>
                        <td className="p-3">{variation.ram} GB</td>
                        <td className="p-3">
                          {formatRom(variation.rom)}{" "}
                          {/* Sử dụng hàm formatRom */}
                        </td>
                        <td className="p-3">{variation.stock}</td>
                        <td className="p-3">
                          {variation.discount
                            ? variation.discount.name
                            : "Không có"}
                        </td>
                        <td className="p-3 flex space-x-2">
                          <Link to={`/product/${variation.product?._id}`}>
                            <button className="bg-blue-500 p-2 text-white rounded-lg">
                              <FaEye />
                            </button>
                          </Link>
                          <Link
                            to={`/admin/dashboard/variation/update/${variation._id}`}
                          >
                            <button className="bg-green-500 p-2 text-white rounded-lg">
                              <FaEdit />
                            </button>
                          </Link>
                          <button
                            className="bg-red-500 p-2 text-white rounded-lg"
                            onClick={() => handleDeleteVariation(variation._id)}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Phân trang */}
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
            </>
          ) : (
            <p className="text-center text-gray-500">Không có biến thể nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}
