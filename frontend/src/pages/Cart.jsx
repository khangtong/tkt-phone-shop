import { useState, useEffect } from "react";
import { FaTrash, FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "../redux/cart/cartSlice";
import { Navigate, Link } from "react-router-dom";

export default function Cart() {
  const dispatch = useDispatch();
  const globalCart = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Format price (VND)
  const formatPrice = (price) => {
    const numberPrice = Number(price);
    if (Number.isNaN(numberPrice)) return "0 ₫";
    return numberPrice.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    });
  };

  // Fetch cart data
  const fetchCartData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch("/api/carts/my-cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 404) {
          const createResponse = await fetch("/api/carts", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!createResponse.ok) throw new Error("Failed to create cart");
          dispatch(
            setCart({ cartDetails: [], totalPrice: 0, totalQuantity: 0 })
          );
        } else {
          throw new Error("Failed to fetch cart");
        }
      } else {
        const data = await response.json();
        dispatch(setCart(data));
        console.log(globalCart);
      }
    } catch (err) {
      setError(err.message);
      dispatch(setCart({ cartDetails: [], totalPrice: 0, totalQuantity: 0 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, [dispatch]);

  const handleQuantityChange = async (
    cartDetailId,
    cartId,
    variationId,
    newQuantity
  ) => {
    if (isUpdating) return;
    const validatedQuantity = Math.max(1, Math.min(99, newQuantity));

    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/cart-details/${cartDetailId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cart: cartId,
          variation: variationId,
          quantity: validatedQuantity,
        }),
      });

      if (!response.ok) throw new Error("Failed to update quantity");

      await fetch("/api/carts/my-cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      await fetchCartData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle remove item
  const handleRemove = async (cartDetailId) => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/cart-details/${cartDetailId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to remove item");
      await fetchCartData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Redirect if not logged in
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  if (loading) return <div className="text-center py-20">Loading cart...</div>;
  if (error) {
    return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h1>

      {isUpdating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <p>Đang cập nhật giỏ hàng...</p>
          </div>
        </div>
      )}

      {globalCart.items?.length > 0 ? (
        <>
          <div className="space-y-4">
            {globalCart.items.map((item) => {
              const discountValid =
                item.discount &&
                new Date(item.discount.startDate) <= new Date() &&
                new Date(item.discount.endDate) >= new Date();

              const discountedPrice = discountValid
                ? Math.round(item.price * (1 - item.discount.amount / 100))
                : null;

              return (
                <div
                  key={item.cartDetailId}
                  className="flex items-center border-b pb-4"
                >
                  <img
                    src={item.product?.image?.[0] || "/placeholder-product.jpg"}
                    alt={item.product?.name || "Sản phẩm"}
                    className="w-20 h-20 object-cover rounded-lg mr-4"
                    onError={(e) => {
                      e.target.src = "/placeholder-product.jpg";
                    }}
                  />

                  <div className="flex-1">
                    <h2 className="font-medium">
                      {item.product?.name || "Sản phẩm"}
                    </h2>
                    {discountValid ? (
                      <div>
                        <p className="text-red-500 font-bold">
                          {formatPrice(discountedPrice)}
                        </p>
                        <p className="text-gray-600 line-through">
                          {formatPrice(item.price)}
                        </p>
                        <p className="bg-red-500 text-white text-xs px-2 py-1 rounded inline-block">
                          Giảm {item.discount.amount}%
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-600">{formatPrice(item.price)}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border rounded">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.cartDetailId,
                            item.cartId,
                            item._id,
                            item.quantity - 1
                          )
                        }
                        disabled={isUpdating || item.quantity <= 1}
                        className="px-2 hover:bg-neutral-100 border-r border-gray-300"
                      >
                        -
                      </button>
                      <span className="px-3">{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.cartDetailId,
                            item.cartId,
                            item._id,
                            item.quantity + 1
                          )
                        }
                        disabled={isUpdating || item.quantity >= 99}
                        className="px-2 hover:bg-neutral-100 border-l border-gray-300"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item.cartDetailId)}
                      disabled={isUpdating}
                      className="text-red-500"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Tổng tiền</h2>
              <p className="text-gray-600">
                {formatPrice(globalCart.totalPrice || 0)}
              </p>
            </div>

            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isUpdating || globalCart.items.length === 0}
            >
              Đặt hàng
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <FaShoppingCart className="mx-auto text-gray-400 text-5xl mb-4" />
          <h2 className="text-xl font-medium mb-2">
            Giỏ hàng của bạn đang trống
          </h2>
          <p className="text-gray-600 mb-6">
            Hãy thêm sản phẩm vào giỏ hàng để tiếp tục
          </p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Mua sắm ngay
          </Link>
        </div>
      )}
    </div>
  );
}
