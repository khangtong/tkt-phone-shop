import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function Product() {
  const { id } = useParams(); // Lấy ID sản phẩm từ URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0); // State để theo dõi ảnh được chọn

  // Fetch thông tin sản phẩm
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Không thể lấy thông tin sản phẩm");
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <p className="text-center text-gray-500">
        Đang tải thông tin sản phẩm...
      </p>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (!product) {
    return (
      <p className="text-center text-gray-500">Không tìm thấy sản phẩm.</p>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Nút quay lại */}
      <Link
        to="/admin/dashboard/product"
        className="inline-flex items-center mb-6 text-blue-600 hover:text-blue-800"
      >
        <FaArrowLeft className="mr-2" />
        Quay lại
      </Link>

      {/* Thông tin sản phẩm */}
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6">{product.name}</h1>

        {/* Hình ảnh sản phẩm */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Ảnh chính */}
            {product.image?.length > 0 ? (
              <div className="w-72 h-72 overflow-hidden rounded-lg border-4 border-gray-200">
                <img
                  src={product.image[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ) : (
              <div className="w-72 h-72 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 border-4 border-gray-200">
                Không có ảnh
              </div>
            )}

            {/* Danh sách ảnh nhỏ */}
            {product.image?.length > 1 && (
              <div className="flex space-x-2">
                {product.image.map((img, index) => (
                  <div
                    key={index}
                    className={`w-16 h-16 overflow-hidden rounded-lg cursor-pointer border-2 ${
                      selectedImage === index
                        ? "border-blue-500"
                        : "border-gray-300"
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={img}
                      alt={`Ảnh ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chi tiết sản phẩm */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Mô tả sản phẩm</h2>
              <p className="text-gray-700 mt-2">{product.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold">Danh mục</h2>
              <p className="text-gray-700 mt-2">
                {product.category?.name || "Không xác định"}
              </p>
            </div>

            {/* Chọn theo màu sắc có kèm giá */}
            {product.variation?.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold">Chọn theo màu sắc</h2>
                <div className="space-y-4 mt-2">
                  {product.variation
                    .filter(
                      (variation, index, self) =>
                        self.findIndex((v) => v.color === variation.color) ===
                        index
                    )
                    .map((variation, index) => (
                      <div
                        key={index}
                        className="border p-4 rounded-lg shadow-sm"
                      >
                        <p className="text-gray-700">
                          <strong>Màu sắc:</strong> {variation.color}
                        </p>
                        <p className="text-gray-700">
                          <strong>Giá:</strong>{" "}
                          {variation.price.toLocaleString()} VNĐ
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Chọn theo RAM có kèm giá */}
            {product.variation?.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold">Chọn theo RAM</h2>
                <div className="space-y-4 mt-2">
                  {product.variation
                    .filter(
                      (variation, index, self) =>
                        self.findIndex((v) => v.ram === variation.ram) === index
                    )
                    .map((variation, index) => (
                      <div
                        key={index}
                        className="border p-4 rounded-lg shadow-sm"
                      >
                        <p className="text-gray-700">
                          <strong>RAM:</strong> {variation.ram} GB
                        </p>
                        <p className="text-gray-700">
                          <strong>Giá:</strong>{" "}
                          {variation.price.toLocaleString()} VNĐ
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
