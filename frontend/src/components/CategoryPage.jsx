import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products`);
        if (!response.ok) throw new Error("Lỗi khi lấy sản phẩm");
        const data = await response.json();

        // Lọc sản phẩm theo danh mục
        const filteredProducts = data.filter(
          (product) => product.category?.name === categoryName
        );

        console.log(filteredProducts); // Log dữ liệu đã lọc
        setProducts(filteredProducts);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchProductsByCategory();
  }, [categoryName]);

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

  return (
    <div className="min-h-screen bg-gray-100 p-3 rounded-xl">
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md p-4 rounded-lg mb-8">
          <div className="uppercase pt-2 pl-2 text-decoration-line: underline">
            {categoryName}
          </div>
          <div className="container mx-auto px-4 py-4 bg-slate-100 rounded-lg">
            {loading ? (
              <p className="text-gray-500">Đang tải sản phẩm...</p>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {products.flatMap((product) =>
                  product.variation?.map((variation) => {
                    const hasDiscount =
                      variation.discount?.amount > 0 &&
                      isDiscountActive(variation.discount);
                    const discountedPrice = hasDiscount
                      ? calculateDiscountedPrice(
                          variation.price,
                          variation.discount.amount
                        )
                      : variation.price;

                    return (
                      <Link
                        key={variation._id}
                        to={`/product/${product._id}`}
                        className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-300"
                      >
                        <div className="relative w-full h-50 overflow-hidden">
                          <img
                            src={product.image[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {hasDiscount && (
                            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                              Giảm {variation.discount.amount}%
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                            {product.name} ({variation.color}, {variation.ram}GB
                            RAM, {formatRom(variation.rom)})
                          </h3>
                          <div className="mt-2">
                            {hasDiscount ? (
                              <>
                                <span className="text-gray-500 line-through text-sm mr-2">
                                  {formatPrice(variation.price)}
                                </span>
                                <div className="flex items-center">
                                  <span className="text-red-600 font-bold text-lg">
                                    {formatPrice(discountedPrice)}
                                  </span>
                                  <span className="ml-2 text-sm text-green-600">
                                    (-{variation.discount.amount}%)
                                  </span>
                                </div>
                              </>
                            ) : (
                              <span className="text-red-600 font-bold text-lg">
                                {formatPrice(variation.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            ) : (
              <p className="text-gray-500">
                Không có sản phẩm nào trong danh mục này.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CategoryPage;
