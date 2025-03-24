import React, { useState, useEffect } from 'react';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setCart } from '../redux/cart/cartSlice';

export default function Cart() {
  const [cart, setLocalCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  // Helper function for formatting prices
  function formatPrice(price) {
    const numberPrice = Number(price);
    if (Number.isNaN(numberPrice)) return price;
    return numberPrice.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    });
  }

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const response = await fetch('/api/carts/my-cart', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          if (response.status === 404) {
            await fetch('/api/carts', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });
            setCartItems([]);
          } else throw new Error('Failed to fetch cart data');
        }
        const data = await response.json();
        console.log(data);
        // Ensure each cart item has a quantity value (default to 1)
        const itemsWithQuantity = data.variation.map((item) => ({
          ...item,
          quantity: item.quantity || 1,
        }));
        setLocalCart(data);
        setCartItems(itemsWithQuantity);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  async function updateCart(updatedCart) {
    try {
      const response = await fetch('/api/carts/my-cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedCart),
      });
      if (!response.ok) throw new Error('Failed to update cart');
    } catch (err) {
      setError(err.message);
      // Re-fetch cart data to restore valid state
      const response = await fetch('/api/carts/my-cart', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const freshData = await response.json();
        const itemsWithQuantity = freshData.variation.map((item) => ({
          ...item,
          quantity: item.quantity || 1,
        }));
        setLocalCart(freshData);
        setCartItems(itemsWithQuantity);
      }
    }
  }

  // Helper: recalc the total price and total quantity from updated items
  function recalcCart(items) {
    const totalQuantity = items.reduce(
      (acc, item) => acc + (item.quantity || 1),
      0
    );
    const totalPrice = items.reduce((acc, item) => {
      const quantity = item.quantity || 1;
      const effectivePrice =
        item.discount && Date.now() <= Date.parse(item.discount.endDate)
          ? +(item.price * (1 - item.discount.amount / 100)).toFixed(0)
          : item.price;
      return acc + effectivePrice * quantity;
    }, 0);
    return { ...cart, variation: items, totalPrice, totalQuantity };
  }

  // Helper: update item quantity and recalc totals
  function updateItemQuantity(itemId, newQuantity) {
    let newCartItems = cartItems
      .map((item) => {
        if (item._id === itemId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
      // Remove items with 0 or less quantity
      .filter((item) => item.quantity > 0);

    const updatedCart = recalcCart(newCartItems);
    setLocalCart(updatedCart);
    setCartItems(newCartItems);
    dispatch(setCart(updatedCart)); // Update global cart state
    updateCart(updatedCart);
  }

  function handleIncrement(itemId) {
    const item = cartItems.find((item) => item._id === itemId);
    const currentQuantity = item.quantity || 1;
    updateItemQuantity(itemId, currentQuantity + 1);
  }

  function handleDecrement(itemId) {
    const item = cartItems.find((item) => item._id === itemId);
    const currentQuantity = item.quantity || 1;
    updateItemQuantity(itemId, currentQuantity - 1);
  }

  function handleRemove(itemId) {
    const newCartItems = cartItems.filter((item) => item._id !== itemId);
    const updatedCart = recalcCart(newCartItems);
    setLocalCart(updatedCart);
    setCartItems(newCartItems);
    dispatch(setCart(updatedCart)); // Update global cart state
    updateCart(updatedCart);
  }

  if (loading) return <div className="text-center py-20">Loading cart...</div>;
  if (error)
    return <div className="text-center py-20 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h1>

      {cartItems.length > 0 ? (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => {
              const currentDate = new Date();
              const discountValid =
                item.discount &&
                currentDate >= new Date(item.discount.startDate) &&
                currentDate <= new Date(item.discount.endDate);
              const discountedPrice = discountValid
                ? Math.round(item.price * (1 - item.discount.amount / 100))
                : null;

              return (
                <div key={item._id} className="flex items-center border-b pb-4">
                  <img
                    src={item.product.image[0]}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg mr-4"
                  />

                  <div className="flex-1">
                    <h2 className="font-medium">{item.product.name}</h2>
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
                        className="px-3 py-1 hover:bg-gray-100"
                        onClick={() => handleDecrement(item._id)}
                      >
                        -
                      </button>
                      <span className="px-3">{item.quantity || 1}</span>
                      <button
                        className="px-3 py-1 hover:bg-gray-100"
                        onClick={() => handleIncrement(item._id)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemove(item._id)}
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
              <p className="text-gray-600">{formatPrice(cart.totalPrice)}</p>
            </div>

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Thanh toán
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
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Mua sắm ngay
          </a>
        </div>
      )}
    </div>
  );
}
