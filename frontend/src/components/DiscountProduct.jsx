import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const DiscountProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeDiscountedVariations, setActiveDiscountedVariations] = useState(
    []
  );
  const [displayCount, setDisplayCount] = useState(10); // Hiển thị 10 sản phẩm ban đầu (2 hàng)

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products`);
        if (!response.ok) throw new Error("Lỗi khi lấy sản phẩm");
        const data = await response.json();

        const discountedVariations = [];
        data.forEach((product) => {
          product.variation.forEach((variant) => {
            if (
              variant.discount?.amount > 0 &&
              isDiscountActive(variant.discount)
            ) {
              discountedVariations.push({
                ...variant,
                product: {
                  _id: product._id,
                  name: product.name,
                  image: product.image,
                  category: product.category,
                },
              });
            }
          });
        });

        setActiveDiscountedVariations(discountedVariations);
        setProducts(data);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchDiscountedProducts();
  }, []);

  const isDiscountActive = (discount) => {
    if (!discount || !discount.startDate || !discount.endDate) return false;
    const currentDate = new Date();
    const startDate = new Date(discount.startDate);
    const endDate = new Date(discount.endDate);
    return currentDate >= startDate && currentDate <= endDate;
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");

  const calculateDiscountedPrice = (price, discountAmount) => {
    return price - (price * discountAmount) / 100;
  };

  const formatRom = (rom) => {
    if (rom > 1023) {
      return `${(rom / 1024).toFixed(0)} TB`;
    }
    return `${rom} GB`;
  };

  const handleShowMore = () => {
    setDisplayCount((prev) => prev + 10); // Mỗi lần click thêm 10 sản phẩm (2 hàng)
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3 rounded-xl">
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md p-4 rounded-lg mb-8">
          <div className="uppercase pt-2 pl-2 text-decoration-line: pb-3 underline">
            SẢN PHẨM GIẢM GIÁ
          </div>
          <div className="container mx-auto px-4 py-4 bg-slate-100 rounded-lg">
            {loading ? (
              <p className="text-gray-500">Đang tải sản phẩm...</p>
            ) : activeDiscountedVariations.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {activeDiscountedVariations
                    .slice(0, displayCount)
                    .map((variation) => {
                      const discountedPrice = calculateDiscountedPrice(
                        variation.price,
                        variation.discount.amount
                      );

                      const product = variation.product || {};
                      const productImage = product.image?.[0];

                      return (
                        <Link
                          key={variation._id}
                          to={`/product/${product._id}`}
                          onClick={() => {
                            localStorage.setItem(
                              "selectedProduct",
                              JSON.stringify({
                                productId: product._id,
                                productName: product.name,
                                productImage: product.image[0],
                                selectedVariation: variation,
                              })
                            );
                          }}
                          className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-300 hover:shadow-lg transition-shadow"
                        >
                          <div className="relative w-full h-49 overflow-hidden">
                            <img
                              src={productImage}
                              alt={product.name || "Sản phẩm"}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                              Giảm {variation.discount.amount}%
                            </span>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 h-14">
                              {product.name} ({variation.color}, {variation.ram}
                              GB RAM, {formatRom(variation.rom)})
                            </h3>
                            <div className="text-gray-500 line-through text-sm">
                              {formatPrice(variation.price)}
                            </div>
                            <div className="flex items-center mt-1">
                              <span className="text-red-600 font-bold text-lg">
                                {formatPrice(discountedPrice)}
                              </span>
                              <span className="ml-2 text-sm text-green-600">
                                (-{variation.discount.amount}%)
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                </div>

                {/* Nút "Hiển thị thêm" chỉ xuất hiện khi còn sản phẩm chưa hiển thị */}
                {activeDiscountedVariations.length > displayCount && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={handleShowMore}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Hiển thị thêm
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">Không có sản phẩm giảm giá.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiscountProduct;
