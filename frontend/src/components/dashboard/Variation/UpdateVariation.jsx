import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../Sidebar";
import {
  updateVariationStart,
  updateVariationSuccess,
  updateVariationFailure,
} from "../../../redux/variation/variationSlice";

export default function UpdateVariation() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { loading, error } = useSelector((state) => state.variation);
  const navigate = useNavigate();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState("variations");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [formData, setFormData] = useState({
    price: "",
    color: "",
    ram: "",
    rom: "",
    stock: "",
  });

  // Fetch danh sách sản phẩm và thông tin biến thể
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch danh sách sản phẩm
        const productsRes = await fetch("/api/products");
        if (!productsRes.ok)
          throw new Error("Không thể lấy danh sách sản phẩm");
        const productsData = await productsRes.json();
        setProducts(productsData);
        console.log("Products Data:", productsData); // Debug

        // Fetch thông tin biến thể
        const variationRes = await fetch(`/api/variations/${id}`);
        if (!variationRes.ok)
          throw new Error("Không thể lấy thông tin variation");
        const variationData = await variationRes.json();
        console.log("Variation Data:", variationData); // Debug

        // Set form data từ thông tin biến thể
        setFormData({
          price: variationData.price,
          color: variationData.color,
          ram: variationData.ram,
          rom: variationData.rom,
          stock: variationData.stock,
        });

        // Set selectedProduct từ productId của biến thể
        if (variationData.productId) {
          setSelectedProduct(variationData.productId);
        } else if (variationData.product?._id) {
          setSelectedProduct(variationData.product._id);
        } else {
          console.error("Không tìm thấy productId trong dữ liệu biến thể");
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error.message);
      }
    }

    fetchData();
  }, [id]);

  // Xử lý thay đổi giá trị trong form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý thay đổi sản phẩm được chọn
  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value);
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert("Bạn phải chọn một sản phẩm trước khi cập nhật variation.");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn cập nhật variation này?"))
      return;

    dispatch(updateVariationStart());

    try {
      const res = await fetch(`/api/variations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify({ ...formData, productId: selectedProduct }),
      });

      const text = await res.text();
      if (!text) throw new Error("Phản hồi từ server rỗng");
      const variationData = JSON.parse(text);
      if (!res.ok) throw new Error(variationData.message || "Có lỗi xảy ra");

      dispatch(updateVariationSuccess(variationData));
      alert("Cập nhật variation thành công!");
      navigate("/admin/dashboard/variation");
    } catch (error) {
      dispatch(updateVariationFailure(error.message));
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="w-4/5 p-6 flex justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-4xl">
          <h2 className="text-xl font-bold mb-4 text-center">
            Cập Nhật Variation
          </h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <select
              name="productId"
              value={selectedProduct}
              onChange={handleProductChange}
              required
              className="w-full p-3 border rounded-xl "
              disabled
            >
              <option value="">Chọn sản phẩm</option>
              {products.length > 0 ? (
                products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))
              ) : (
                <option disabled>Đang tải danh sách sản phẩm...</option>
              )}
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
            <button
              type="submit"
              className="w-full p-3 bg-blue-500 text-white rounded-xl flex items-center justify-center"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Cập Nhật Variation"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
