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

  const [activeTab, setActiveTab] = useState("variations");
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [formData, setFormData] = useState({
    price: "",
    color: "",
    ram: "",
    rom: "",
    stock: "",
    discount: "",
  });
  const [formErrors, setFormErrors] = useState({});

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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value);
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!selectedProduct) {
      errors.product = "Bạn phải chọn một sản phẩm";
      isValid = false;
    }

    if (!formData.color) {
      errors.color = "Màu sắc là bắt buộc";
      isValid = false;
    }

    if (!formData.ram || formData.ram <= 0) {
      errors.ram = "RAM phải lớn hơn 0";
      isValid = false;
    }

    if (!formData.rom || formData.rom <= 0) {
      errors.rom = "ROM phải lớn hơn 0";
      isValid = false;
    }

    if (!formData.price || formData.price <= 0) {
      errors.price = "Giá phải lớn hơn 0";
      isValid = false;
    }

    if (!formData.stock || formData.stock <= 0) {
      errors.stock = "Tồn kho phải lớn hơn 0";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn thêm biến thể này?")) return;

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
          discount: formData.discount || null,
        }),
      });

      const text = await res.text();
      if (!text) throw new Error("Phản hồi từ server rỗng");
      const variationData = JSON.parse(text);
      if (!res.ok) throw new Error(variationData.message || "Có lỗi xảy ra");

      dispatch(addVariationSuccess(variationData));
      alert("Thêm biến thể thành công!");
      navigate("/admin/dashboard/variation");
    } catch (error) {
      dispatch(addVariationFailure(error.message));
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="w-4/5 p-6 flex justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-4xl">
          <h2 className="text-xl font-bold mb-4 text-center">Thêm biến thể</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <select
                name="productId"
                value={selectedProduct}
                onChange={handleProductChange}
                className="w-full p-3 border rounded-xl"
              >
                <option value="">Chọn sản phẩm</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {formErrors.product && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.product}
                </p>
              )}
            </div>

            <div>
              <input
                type="text"
                name="color"
                placeholder="Màu sắc"
                value={formData.color}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl"
              />
              {formErrors.color && (
                <p className="text-red-500 text-sm mt-1">{formErrors.color}</p>
              )}
            </div>

            <div>
              <input
                type="number"
                name="ram"
                placeholder="RAM (GB)"
                min="1"
                value={formData.ram}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl"
              />
              {formErrors.ram && (
                <p className="text-red-500 text-sm mt-1">{formErrors.ram}</p>
              )}
            </div>

            <div>
              <input
                type="number"
                name="rom"
                placeholder="ROM (GB)"
                min="1"
                value={formData.rom}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl"
              />
              {formErrors.rom && (
                <p className="text-red-500 text-sm mt-1">{formErrors.rom}</p>
              )}
            </div>

            <div>
              <input
                type="number"
                name="price"
                placeholder="Giá"
                min="1"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl"
              />
              {formErrors.price && (
                <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
              )}
            </div>

            <div>
              <input
                type="number"
                name="stock"
                placeholder="Tồn kho"
                min="1"
                value={formData.stock}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl"
              />
              {formErrors.stock && (
                <p className="text-red-500 text-sm mt-1">{formErrors.stock}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-green-500 text-white rounded-xl flex items-center justify-center hover:bg-green-600 transition-colors"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Thêm biến thể"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
