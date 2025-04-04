import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Label, Radio, Toast } from "flowbite-react";
import vnpay_icon from "../assets/icon/vnpay.jpg";
import cod_icon from "../assets/icon/cod.png";
import { HiCheck, HiX } from "react-icons/hi";
import { clearCart } from "../redux/cart/cartSlice";

export default function Checkout() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    paymentMethod: "COD",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (!location.state?.canAccessCheckout || !cart.items?.length) {
      navigate("/cart");
    }
  }, [navigate, location, cart.items]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRadioChange = (e) => {
    setFormData({ ...formData, paymentMethod: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên";
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    if (!/^\d{10,11}$/.test(formData.phone))
      newErrors.phone = "Số điện thoại không hợp lệ";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Email không hợp lệ";
    if (!formData.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      if (!cart.items || cart.items.length === 0) {
        throw new Error("Giỏ hàng trống, không thể đặt hàng");
      }
      // Kiểm tra stock cho tất cả sản phẩm trong giỏ hàng
      for (const item of cart.items) {
        const variationRes = await fetch(`/api/variations/${item._id}`);
        const variationData = await variationRes.json();

        if (!variationData || variationData.stock < item.quantity) {
          throw new Error(`Sản phẩm ${item.product.name} hiện không còn hàng`);
        }
      }

      // Tạo đơn hàng trước
      const orderPayload = {
        delivery_address: formData.address,
        paymentMethod: formData.paymentMethod,
        total: cart.totalPrice,
        contactPhone: formData.phone,
        customerName: formData.fullName,
        customerEmail: formData.email,
      };

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!orderResponse.ok) {
        throw new Error("Tạo đơn hàng thất bại");
      }

      const orderData = await orderResponse.json();
      const orderId = orderData._id; // Lấy ID từ phản hồi

      //Sau đó tạo các order details
      const orderDetailsResponses = await Promise.all(
        cart.items.map(async (item) => {
          try {
            const variationRes = await fetch(`/api/variations/${item._id}`);
            const variationData = await variationRes.json();

            if (!variationData || variationData.stock < item.quantity) {
              throw new Error(
                `Sản phẩm ${item.product.name} hiện không còn hàng`
              );
            }

            const payload = {
              orderId, // Sử dụng orderId vừa tạo
              productId: item.product._id,
              variationId: variationData._id,
              quantity: item.quantity,
              priceAtPurchase: Math.round(
                item.discount?.amount
                  ? item.price * (1 - item.discount.amount / 100)
                  : item.price
              ),
              discountAtPurchase: item.discount?.amount || 0,
            };

            const res = await fetch("/api/orderDetails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Validation failed");
            return data;
          } catch (err) {
            console.error(`Lỗi với sản phẩm ${item.product.name}:`, err);
            throw err;
          }
        })
      );

      // Xử lý thanh toán nếu cần
      if (formData.paymentMethod === "VNPAY") {
        // Gọi API thanh toán VNPay
        const res = await fetch("/api/payment/vnpay-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setToast({
            type: "success",
            message: "Đang chuyển hướng đến VNPay...",
          });
          setTimeout(() => {
            window.location.href = data.vnpayUrl; // Chuyển hướng đến VNPay sau 2s
          }, 2000);
        } else {
          setToast({ type: "error", message: data.message });
        }
      } else if (formData.paymentMethod === "COD") {
        // Gọi API thanh toán COD
        const res = await fetch("/api/payment/cod-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await res.json();
        console.log(data);

        if (data.success) {
          setToast({
            type: "success",
            message: "Thanh toán thành công! Đang chuyển trang...",
          });
          setTimeout(() => {
            navigate(`/payment-success/${data.paymentId}`); // Chuyển hướng sau 3s
          }, 3000);
        } else {
          setToast({ type: "error", message: data.message });
        }
      }
    } catch (error) {
      console.error("Lỗi khi gọi API thanh toán:", error);
      setToast({ type: "error", message: "Đã xảy ra lỗi, vui lòng thử lại!" });
    }
  };
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white shadow-xl rounded-xl mt-4 md:mt-12">
      {toast && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 mt-5 z-50">
          <Toast>
            <div
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                toast.type === "success"
                  ? "bg-green-100 text-green-500"
                  : "bg-red-100 text-red-500"
              }`}
            >
              {toast.type === "success" ? (
                <HiCheck className="h-5 w-5" />
              ) : (
                <HiX className="h-5 w-5" />
              )}
            </div>
            <div className="ml-3 text-sm font-normal">{toast.message}</div>
            <Toast.Toggle />
          </Toast>
        </div>
      )}

      <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-6">
        Thông Tin Đặt Hàng
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin giao hàng */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Thông Tin Giao Hàng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Họ Tên*
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Số Điện Thoại*
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-1">
              Email*
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-1">
              Địa Chỉ Giao Hàng*
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>
        </div>

        {/* Phương thức thanh toán */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-700 mb-3">
            Hình Thức Thanh Toán*
          </h2>
          <div className="space-y-3">
            <div
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${
                formData.paymentMethod === "COD"
                  ? "border-blue-500 bg-blue-50"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setFormData({ ...formData, paymentMethod: "COD" })}
            >
              <Radio
                id="cod"
                name="payments"
                value="COD"
                checked={formData.paymentMethod === "COD"}
                onChange={handleRadioChange}
              />
              <Label
                htmlFor="cod"
                className="flex items-center gap-2 cursor-pointer"
              >
                <img src={cod_icon} alt="COD" className="w-6" />
                <div>
                  <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
                  <p className="text-sm text-gray-500">
                    Không cần thanh toán trước
                  </p>
                </div>
              </Label>
            </div>
            <div
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${
                formData.paymentMethod === "VNPAY"
                  ? "border-blue-500 bg-blue-50"
                  : "hover:bg-gray-100"
              }`}
              onClick={() =>
                setFormData({ ...formData, paymentMethod: "VNPAY" })
              }
            >
              <Radio
                id="vnpay"
                name="payments"
                value="VNPAY"
                checked={formData.paymentMethod === "VNPAY"}
                onChange={handleRadioChange}
              />
              <Label
                htmlFor="vnpay"
                className="flex items-center gap-2 cursor-pointer"
              >
                <img src={vnpay_icon} alt="VNPay" className="w-6" />
                <div>
                  <p className="font-medium">Thanh toán qua VNPay</p>
                  <p className="text-sm text-gray-500">
                    Thẻ ATM, Visa, Mastercard
                  </p>
                </div>
              </Label>
            </div>
          </div>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="bg-gray-100 p-5 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold">Tóm Tắt Đơn Hàng</h2>
          <ul className="space-y-2">
            {cart?.items?.length > 0 ? (
              cart.items.map((item, index) => {
                const discountValid =
                  item.discount &&
                  new Date(item.discount.startDate) <= new Date() &&
                  new Date(item.discount.endDate) >= new Date();

                const discountedPrice = discountValid
                  ? Math.round(item.price * (1 - item.discount.amount / 100))
                  : item.price;

                return (
                  <li key={index} className="flex justify-between">
                    <span>{item.product.name}</span>
                    <span>
                      {item.quantity} x {discountedPrice.toLocaleString()}₫
                    </span>
                  </li>
                );
              })
            ) : (
              <p className="text-center text-gray-500">Giỏ hàng trống</p>
            )}
          </ul>
          <p className="text-right font-bold text-lg mt-4 text-red-600">
            Tổng Tiền: {cart.totalPrice.toLocaleString()}₫
          </p>
        </div>

        {/* Nút xác nhận */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg text-white font-medium ${
            isSubmitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Đang xử lý..." : "Xác Nhận Đặt Hàng"}
        </button>
      </form>
    </div>
  );
}
