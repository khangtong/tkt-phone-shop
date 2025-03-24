import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import hinh1 from "../assets/banner/hinh1.png";
import hinh2 from "../assets/banner/hinh2.webp";
import hinh3 from "../assets/banner/hinh3.webp";
import hinh4 from "../assets/banner/hinh4.webp";
const Home = () => {
  const [categories, setCategories] = useState([]);
  const [variations, setVariations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingVariations, setLoadingVariations] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const categoriesContainerRef = useRef(null);
  const productsContainerRefs = useRef({});
  const discountsContainerRef = useRef(null);

  //img
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const banners = [hinh1, hinh2, hinh3, hinh4];
  const bannerIntervalRef = useRef();

  useEffect(() => {
    startBannerInterval();
    return () => clearInterval(bannerIntervalRef.current);
  }, [banners.length]);

  const startBannerInterval = () => {
    clearInterval(bannerIntervalRef.current);
    bannerIntervalRef.current = setInterval(() => {
      goToNextBanner();
    }, 5000);
  };

  const goToNextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const goToPrevBanner = () => {
    setCurrentBannerIndex(
      (prev) => (prev - 1 + banners.length) % banners.length
    );
  };

  const goToBanner = (index) => {
    setCurrentBannerIndex(index);
    startBannerInterval();
  };

  useEffect(() => {
    fetchCategories();
    fetchVariations();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Lỗi khi lấy danh mục");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
    setLoadingCategories(false);
  };

  const fetchVariations = async () => {
    setLoadingVariations(true);
    try {
      const response = await fetch("/api/variations");
      if (!response.ok) throw new Error("Lỗi khi lấy biến thể");
      const data = await response.json();
      setVariations(data);
    } catch (error) {
      console.error(error);
    }
    setLoadingVariations(false);
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Lỗi khi lấy sản phẩm");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
    setLoadingProducts(false);
  };

  const groupProductsByCategory = () => {
    const groupedProducts = {};

    categories.forEach((category) => {
      groupedProducts[category.name] = [];
    });

    products.forEach((product) => {
      if (product.category && groupedProducts[product.category.name]) {
        groupedProducts[product.category.name].push(product);
      }
    });

    return groupedProducts;
  };

  const isDiscountActive = (discount) => {
    if (!discount || !discount.startDate || !discount.endDate) return false;
    const currentDate = new Date();
    const startDate = new Date(discount.startDate);
    const endDate = new Date(discount.endDate);
    return currentDate >= startDate && currentDate <= endDate;
  };

  const scrollContainer = (containerRef, direction) => {
    if (containerRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      containerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollCategoriesLeft = () =>
    scrollContainer(categoriesContainerRef, "left");
  const scrollCategoriesRight = () =>
    scrollContainer(categoriesContainerRef, "right");

  const scrollDiscountsLeft = () =>
    scrollContainer(discountsContainerRef, "left");
  const scrollDiscountsRight = () =>
    scrollContainer(discountsContainerRef, "right");

  const groupedProducts = groupProductsByCategory();

  const activeDiscountedVariations = variations.filter((variation) => {
    return (
      variation.discount &&
      variation.discount.amount > 0 &&
      isDiscountActive(variation.discount)
    );
  });

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

  const handleVariantChange = (productId, variant) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variant,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3 rounded-xl">
      {/* Danh mục */}
      <header className="bg-white shadow-md p-6 mt-8 rounded-lg mb-8">
        <div className="uppercase pt-2 pl-2 text-decoration-line: underline">
          Danh mục
        </div>
        <div className="container mx-auto px-4 py-4 relative bg-slate-100 rounded-lg">
          <button
            onClick={scrollCategoriesLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10"
          >
            &lt;
          </button>
          <nav
            ref={categoriesContainerRef}
            className="flex overflow-x-auto scrollbar-hide gap-5"
          >
            {loadingCategories ? (
              <p className="text-gray-500">Đang tải danh mục...</p>
            ) : (
              categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/category/${category.name}`}
                  className="flex flex-col items-center whitespace-nowrap px-4 py-2 bg-slate-50 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition duration-300 border border-gray-300"
                >
                  <img
                    src={category.logo}
                    alt={category.name}
                    className="w-[85px] h-[85px] object-contain bg-slate-200 rounded-full"
                  />
                  <span className="mt-2 text-sm sm:text-base">
                    {category.name}
                  </span>
                </Link>
              ))
            )}
          </nav>
          <button
            onClick={scrollCategoriesRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10"
          >
            &gt;
          </button>
        </div>
      </header>

      {/* Banner với kích thước full khung hình */}
      <section className="mb-8 rounded-lg overflow-hidden relative group w-full h-[340px]">
        <div className="relative w-full h-full">
          <img
            src={banners[currentBannerIndex]}
            alt={`Banner ${currentBannerIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-500"
            style={{ minWidth: "1500px" }} // Đảm bảo hình ảnh đủ rộng
          />
          {/* Nút điều hướng trái */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevBanner();
              startBannerInterval();
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous banner"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          {/* Nút điều hướng phải */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNextBanner();
              startBannerInterval();
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next banner"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Các chấm indicator */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToBanner(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentBannerIndex
                  ? "bg-white w-6"
                  : "bg-gray-400 hover:bg-gray-300"
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Sản phẩm giảm giá */}
      <section className="bg-white shadow-md p-4 rounded-lg mb-8">
        <div className="uppercase pt-2 pl-2 text-decoration-line: underline mb-5 text-blue-700">
          <Link to={"/product/discount"}> Sản phẩm giảm giá</Link>
        </div>
        <div className="container mx-auto px-4 py-4 relative bg-slate-100 rounded-lg">
          <button
            onClick={scrollDiscountsLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10"
          >
            &lt;
          </button>
          <div
            ref={discountsContainerRef}
            className="flex overflow-x-auto scrollbar-hide gap-5"
          >
            {activeDiscountedVariations.length > 0 ? (
              activeDiscountedVariations.map((variation) => {
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
                    className="flex-none bg-white rounded-lg shadow-md overflow-hidden border border-gray-300"
                    style={{ width: "270px", height: "420px" }}
                  >
                    <div className="relative w-full h-50 overflow-hidden">
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
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                        {product.name} ({variation.color}, {variation.ram}GB
                        RAM, {formatRom(variation.rom)})
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
              })
            ) : (
              <p className="text-gray-500">Không có sản phẩm giảm giá.</p>
            )}
          </div>
          <button
            onClick={scrollDiscountsRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10"
          >
            &gt;
          </button>
        </div>
      </section>

      {/* Sản phẩm theo danh mục */}
      <main className="container mx-auto px-4 py-8">
        {Object.keys(groupedProducts).map((categoryName) => (
          <div
            key={categoryName}
            className="bg-white shadow-md p-4 rounded-lg mb-8"
          >
            <div className="uppercase pt-2 pl-2 text-decoration-line: font-weight: 800 underline pb-3 text-blue-700">
              <Link to={`/category/${categoryName}`}>
                {" "}
                <span>{categoryName} đáng mua nhất </span>
              </Link>
            </div>
            <div className="container mx-auto px-4 py-4 relative bg-slate-100 rounded-lg">
              <nav
                ref={(ref) =>
                  (productsContainerRefs.current[categoryName] = ref)
                }
                className="flex overflow-x-auto scrollbar-hide gap-5"
              >
                {groupedProducts[categoryName].map((product) => {
                  const selectedVariant =
                    selectedVariants[product._id] ||
                    (product.variation && product.variation.length > 0
                      ? product.variation[0]
                      : null);

                  // Kiểm tra nếu không có biến thể
                  if (!selectedVariant) {
                    return null; // Không hiển thị sản phẩm nếu không có biến thể
                  }

                  const hasDiscount =
                    selectedVariant.discount?.amount > 0 &&
                    isDiscountActive(selectedVariant.discount);
                  const discountedPrice = hasDiscount
                    ? calculateDiscountedPrice(
                        selectedVariant.price,
                        selectedVariant.discount.amount
                      )
                    : selectedVariant.price;

                  return (
                    <div
                      key={product._id}
                      className="flex-none bg-white rounded-lg shadow-md overflow-hidden border border-gray-300"
                      style={{ width: "270px", height: "520px" }}
                    >
                      <Link
                        to={`/product/${product._id}`}
                        onClick={() => {
                          localStorage.setItem(
                            "selectedProduct",
                            JSON.stringify({
                              productId: product._id,
                              productName: product.name,
                              productImage: product.image[0],
                              selectedVariation: selectedVariant,
                            })
                          );
                        }}
                      >
                        <div className="relative w-full h-50 overflow-hidden">
                          <img
                            src={product.image[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {hasDiscount && (
                            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                              Giảm {selectedVariant.discount.amount}%
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                            {product.name} ({selectedVariant.color},{" "}
                            {selectedVariant.ram}GB RAM,{" "}
                            {formatRom(selectedVariant.rom)})
                          </h3>
                          <div className="mt-2">
                            {hasDiscount ? (
                              <>
                                <span className="text-gray-500 line-through text-sm mr-2">
                                  {formatPrice(selectedVariant.price)}
                                </span>
                                <div className="flex items-center">
                                  <span className="text-red-600 font-bold text-lg">
                                    {formatPrice(discountedPrice)}
                                  </span>
                                  <span className="ml-2 text-sm text-green-600">
                                    (-{selectedVariant.discount.amount}%)
                                  </span>
                                </div>
                              </>
                            ) : (
                              <span className="text-red-600 font-bold text-lg">
                                {formatPrice(selectedVariant.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* Hiển thị các tùy chọn biến thể */}
                      <div className="p-4 mt-4">
                        <select
                          onChange={(e) => {
                            const selectedVariantId = e.target.value;
                            const selectedVariant = product.variation.find(
                              (v) => v._id === selectedVariantId
                            );
                            handleVariantChange(product._id, selectedVariant);
                          }}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          {product.variation.map((variant) => (
                            <option key={variant._id} value={variant._id}>
                              {variant.ram}GB RAM, {formatRom(variant.rom)},{" "}
                              {variant.color}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Home;
