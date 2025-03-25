import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Toast } from "flowbite-react";
import { HiCheck, HiX } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../redux/user/userSlice";
import { setCart } from "../redux/cart/cartSlice";

export default function Login() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(loginStart());
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        dispatch(loginFailure(data.message));
        return;
      }

      // Lưu token vào localStorage
      localStorage.setItem("token", data.token);

      // Fetch giỏ hàng sau khi đăng nhập thành công
      try {
        const cartRes = await fetch("/api/carts/my-cart", {
          headers: { Authorization: `Bearer ${data.token}` },
        });

        if (cartRes.ok) {
          const cartData = await cartRes.json();
          dispatch(
            setCart({
              items: cartData.variation || [],
              totalPrice: cartData.totalPrice || 0,
              totalQuantity: cartData.totalQuantity || 0,
            })
          );
        }
      } catch (cartError) {
        console.error("Lỗi khi lấy giỏ hàng:", cartError);
      }

      dispatch(loginSuccess(data.user));
      setShowToast(true);

      // Xử lý redirect sau khi đăng nhập
      const redirectUrl = localStorage.getItem("redirectUrl");
      setTimeout(() => {
        if (redirectUrl) {
          localStorage.removeItem("redirectUrl");
          navigate(redirectUrl);
        } else {
          navigate(data.user.role === "ADMIN" ? "/admin/dashboard" : "/");
        }
      }, 1000);
    } catch (error) {
      dispatch(loginFailure(error.message));
    }
  };

  return (
    <div className="max-w-sm mx-auto">
      {/* Toast thông báo thành công */}
      {showToast && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 mt-5 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500">
              <HiCheck className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">
              Đăng nhập thành công! Đang chuyển hướng...
            </div>
          </Toast>
        </div>
      )}

      {/* Hiển thị lỗi */}
      {error && (
        <div className="mb-4">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500">
              <HiX className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">{error}</div>
          </Toast>
        </div>
      )}

      <h1 className="text-3xl text-center font-semibold my-7">Đăng nhập</h1>

      <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
        <div className="mb-5">
          <label className="block mb-1 text-sm font-medium text-gray-700 ml-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 focus:outline-none"
            placeholder="Email"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-5">
          <label className="block mb-1 text-sm font-medium text-gray-700 ml-1">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 focus:outline-none"
            placeholder="Nhập mật khẩu"
            onChange={handleChange}
            required
          />
        </div>

        <button
          disabled={loading}
          className={`w-full p-2.5 text-white font-medium rounded-lg text-sm text-center shadow-xs uppercase ${
            loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <div className="flex items-center justify-between flex-col md:flex-row mt-5">
        <div className="flex items-center">
          <p>Bạn chưa có tài khoản?</p>
          <Link
            to="/register"
            className="text-blue-600 ml-2 font-semibold hover:underline"
          >
            Đăng ký
          </Link>
        </div>
        <Link
          to="/forgot-password"
          className="text-blue-600 font-semibold hover:underline"
        >
          Quên mật khẩu?
        </Link>
      </div>
    </div>
  );
}
