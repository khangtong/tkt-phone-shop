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

export default function Login() {
  const [formData, setFormData] = useState({});

  const { loading, error } = useSelector((state) => state.user);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(loginStart());
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        dispatch(loginFailure(data.message));
        return;
      }

      dispatch(loginSuccess(data.user));
      setShowToast(true);

      setTimeout(() => {
        if (data.user.role === "ADMIN") {
          navigate("/admin/dashboard/product");
        } else {
          navigate("/");
        }
      }, 1000);
    } catch (error) {
      dispatch(loginFailure(error.message));
    }
  };

  return (
    <div className="max-w-sm mx-auto">
      {/* Hiển thị thông báo ở trên cùng */}
      {showToast && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 mt-5 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
              <HiCheck className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">
              Đăng nhập thành công!
            </div>
            <Toast.Toggle />
          </Toast>
        </div>
      )}

      {/* Hiển thị lỗi bên trên form */}
      {error && (
        <div className="mb-4">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
              <HiX className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">{error}</div>
            <Toast.Toggle />
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
          className="w-full p-2.5 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm text-center shadow-xs uppercase"
        >
          {loading ? "Đang tải..." : "Đăng nhập"}
        </button>
      </form>

      <div className="flex items-center justify-between flex-col md:flex-row mt-5">
        <div className="flex items-center">
          <p>Bạn chưa có tài khoản?</p>
          <Link to={"/register"}>
            <span className="text-blue-600 ml-2 font-semibold">Đăng ký</span>
          </Link>
        </div>
        <Link to={"/forgot-password"}>
          <span className="text-blue-600 font-semibold">Quên mật khẩu?</span>
        </Link>
      </div>
    </div>
  );
}
