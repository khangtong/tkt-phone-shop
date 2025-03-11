import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Sidebar";
import {
  addVariationStart,
  addVariationSuccess,
  addVariationFailure,
} from "../../../redux/variation/variationSlice";

export default function CreateVariation() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { loading, error } = useSelector((state) => state.variation);
  const navigate = useNavigate();

  // State activeTab
  const [activeTab, setActiveTab] = useState("variations");

  const [products, setProducts] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [discounts, setDiscounts] = useState([]); // State để lưu danh sách discount
  const [selectedProduct, setSelectedProduct] = useState("");
  const [formData, setFormData] = useState({
    price: "",
    color: "",
    ram: "",
    rom: "",
    stock: "",
    discount: "", // Thêm trường discount vào formData
  });

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Không thể lấy danh sách sản phẩm");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error.message);
      }
    }

    async function fetchDiscounts() {
      try {
        const res = await fetch("/api/discounts");
        if (!res.ok) throw new Error("Không thể lấy danh sách discount");
        const data = await res.json();
        setDiscounts(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách discount:", error.message);
      }
    }

    fetchProducts();
    fetchDiscounts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert("Bạn phải chọn một sản phẩm trước khi thêm variation.");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn thêm variation này?")) return;

    dispatch(addVariationStart());

    try {
      const res = await fetch("/api/variations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify({
          ...formData,
          productId: selectedProduct,
          discount: formData.discount || null, // Gửi discount hoặc null nếu không có
        }),
      });

      const text = await res.text();
      if (!text) throw new Error("Phản hồi từ server rỗng");
      const variationData = JSON.parse(text);
      if (!res.ok) throw new Error(variationData.message || "Có lỗi xảy ra");

      dispatch(addVariationSuccess(variationData));
      alert("Thêm variation thành công!");
      navigate("/admin/dashboard/variation");
    } catch (error) {
      dispatch(addVariationFailure(error.message));
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Truyền activeTab và setActiveTab vào Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="w-4/5 p-6 flex justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-4xl">
          <h2 className="text-xl font-bold mb-4 text-center">Thêm Variation</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <select
              name="productId"
              value={selectedProduct}
              onChange={handleProductChange}
              required
              className="w-full p-3 border rounded-xl"
            >
              <option value="">Chọn sản phẩm</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="color"
              placeholder="Màu sắc"
              value={formData.color}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-xl"
            />
            <input
              type="number"
              name="ram"
              placeholder="RAM (GB)"
              value={formData.ram}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-xl"
            />
            <input
              type="number"
              name="rom"
              placeholder="ROM (GB)"
              value={formData.rom}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-xl"
            />
            <input
              type="number"
              name="price"
              placeholder="Giá"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-xl"
            />
            <input
              type="number"
              name="stock"
              placeholder="Tồn kho"
              value={formData.stock}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-xl"
            />
            {/* <select
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl"
            >
              <option value="">Chọn mã giảm giá (nếu có)</option>
              {discounts.map((discount) => (
                <option key={discount._id} value={discount._id}>
                  {discount.name} - {discount.percentage}%
                </option>
              ))}
            </select> */}
            <button
              type="submit"
              className="w-full p-3 bg-green-500 text-white rounded-xl flex items-center justify-center"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Thêm Variation"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
