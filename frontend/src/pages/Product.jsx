import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedRom, setSelectedRom] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [noProduct, setNoProduct] = useState(false);

  // Hàm hỗ trợ chuyển đổi ROM
  const formatRom = (rom) => {
    if (rom > 1023) {
      return `${(rom / 1024).toFixed(0)} TB`;
    }
    return `${rom} GB`;
  };

  // Fetch dữ liệu sản phẩm và biến thể
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch thông tin sản phẩm
        const productRes = await fetch(`/api/products/${id}`);
        if (!productRes.ok) throw new Error("Không thể lấy thông tin sản phẩm");
        const productData = await productRes.json();
        setProduct(productData);

        // Fetch danh sách biến thể
        const variationsRes = await fetch(`/api/variations`);
        if (!variationsRes.ok)
          throw new Error("Không thể lấy thông tin biến thể");
        const variationsData = await variationsRes.json();

        // Lọc biến thể theo productId
        const filteredVariations = variationsData.filter(
          (v) => v.product._id === id
        );

        setVariations(filteredVariations);

        // Lấy thông tin sản phẩm được chọn từ localStorage
        const storedProduct = JSON.parse(
          localStorage.getItem("selectedProduct")
        );

        if (storedProduct && storedProduct.productId === id) {
          const selectedVariation = storedProduct.selectedVariation;

          // Kiểm tra xem biến thể được chọn có tồn tại trong danh sách biến thể đã lọc không
          const variationExists = filteredVariations.some(
            (v) => v._id === selectedVariation._id
          );

          if (variationExists) {
            setSelectedColor(selectedVariation.color);
            setSelectedRom(selectedVariation.rom);
          } else {
            setNoProduct(true);
          }
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Cập nhật giá khi chọn màu & ROM
  useEffect(() => {
    if (selectedColor && selectedRom && variations.length > 0) {
      const variation = variations.find(
        (v) => v.color === selectedColor && v.rom === selectedRom
      );

      if (variation) {
        console.log("Selected Variation:", variation);
        console.log("Discount Info:", variation.discount);

        const originalPrice = variation.price;

        let discountAmount = 0;
        if (variation.discount) {
          const currentDate = new Date();
          const startDate = new Date(variation.discount.startDate);
          const endDate = new Date(variation.discount.endDate);

          if (currentDate >= startDate && currentDate <= endDate) {
            discountAmount = variation.discount.amount;
          }
        }

        const discountedPrice = Math.round(
          originalPrice * (1 - discountAmount / 100)
        );

        setSelectedPrice({
          original: originalPrice,
          discounted: discountedPrice,
          discountPercent: discountAmount,
        });
        setNoProduct(false);
      } else {
        setSelectedPrice(null);
        setNoProduct(true);
      }
    } else {
      setNoProduct(false);
    }
  }, [selectedColor, selectedRom, variations]);
  // Lấy danh sách màu duy nhất từ các biến thể của sản phẩm
  const uniqueColors = [...new Set(variations.map((v) => v.color) || [])];

  if (loading)
    return (
      <p className="text-center text-gray-500">
        Đang tải thông tin sản phẩm...
      </p>
    );
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!product)
    return (
      <p className="text-center text-gray-500">Không tìm thấy sản phẩm.</p>
    );

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <Link
        to="/"
        className="inline-flex items-center mb-6 text-blue-600 hover:text-blue-800"
      >
        <FaArrowLeft className="mr-2" /> Quay lại
      </Link>

      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6">{product.name}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Phần hình ảnh */}
          <div className="space-y-6">
            {product.image?.length > 0 ? (
              <div className="w-72 h-72 overflow-hidden rounded-lg border-4 border-gray-200">
                <img
                  src={product.image[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-72 h-72 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 border-4 border-gray-200">
                Không có ảnh
              </div>
            )}

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
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phần thông tin sản phẩm */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Mô tả sản phẩm</h2>
              <p className="text-gray-700 mt-2">{product.description}</p>
            </div>

            {/* Chọn màu */}
            {variations.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold">Chọn màu sắc</h2>
                <div className="space-y-2 mt-2">
                  {uniqueColors.map((color, index) => (
                    <label key={index} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="color"
                        checked={selectedColor === color}
                        onChange={() => {
                          setSelectedColor(color);
                          setSelectedRom(null);
                          setSelectedPrice(null);
                          setNoProduct(false);
                        }}
                        className="form-radio h-5 w-5 text-blue-600"
                      />
                      <span className="text-gray-700">{color}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Chọn ROM */}
            {variations.length > 0 && selectedColor && (
              <div>
                <h2 className="text-xl font-semibold">Chọn ROM</h2>
                <div className="space-y-2 mt-2">
                  {[
                    ...new Set(
                      variations
                        .filter((v) => v.color === selectedColor)
                        .map((v) => v.rom)
                    ),
                  ]
                    .sort((a, b) => a - b) // Sắp xếp ROM từ thấp đến cao
                    .map((rom, index) => (
                      <label
                        key={index}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="radio"
                          name="rom"
                          checked={selectedRom === rom}
                          onChange={() => setSelectedRom(rom)}
                          className="form-radio h-5 w-5 text-blue-600"
                        />
                        <span className="text-gray-700">{formatRom(rom)}</span>{" "}
                        {/* Sử dụng hàm formatRom */}
                      </label>
                    ))}
                </div>
              </div>
            )}

            {/* Hiển thị giá */}
            {noProduct && (
              <p className="text-red-500">Không có sản phẩm theo lựa chọn.</p>
            )}

            {selectedPrice && (
              <div className="mt-4">
                <h2 className="text-xl font-semibold">
                  Giá:{" "}
                  <span className="text-red-500 font-bold">
                    {selectedPrice.discounted.toLocaleString()} VNĐ
                  </span>
                  {selectedPrice.discountPercent > 0 ? (
                    <>
                      <span className="text-gray-500 line-through ml-2">
                        {selectedPrice.original.toLocaleString()} VNĐ
                      </span>
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded ml-2">
                        Giảm {selectedPrice.discountPercent}%
                      </span>
                    </>
                  ) : (
                    ""
                  )}
                </h2>
              </div>
            )}

            {/* Nút thao tác */}
            <div className="flex space-x-4 mt-6">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700">
                Thêm vào giỏ hàng
              </button>
              <button className="bg-red-600 text-white px-6 py-3 rounded-lg shadow hover:bg-red-700">
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
