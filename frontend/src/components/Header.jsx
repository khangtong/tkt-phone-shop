import { Link, useNavigate, useLocation } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import { FiShoppingCart } from "react-icons/fi";
import { GrSearch } from "react-icons/gr";
import { useDispatch, useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { logout } from "../redux/user/userSlice";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const location = useLocation(); // Theo dõi thay đổi route

  // Hàm đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Đóng dropdown khi route thay đổi
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <header className="bg-blue-100 shadow-md sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-4">
        {/* Logo */}
        <Link to="/">
          <h1 className="font-bold text-xs sm:text-2xl flex flex-wrap">
            <span className="text-emerald-500 pr-2">TKTShop</span>
          </h1>
        </Link>

        {/* Ô tìm kiếm */}
        <div className="flex items-center w-full justify-center max-w-sm">
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-1 rounded-l-md border-none focus:outline-0"
          />
          <button className="text-base min-w-[80px] h-8 bg-blue-600 flex items-center justify-center rounded-r-md text-white">
            <GrSearch />
            <span className="text-xs sm:text-xs hidden sm:inline">
              {" "}
              Tìm kiếm
            </span>
          </button>
        </div>

        {/* Điều hướng */}
        <ul className="flex gap-4 items-center">
          <Link to="/">
            <li className="text-base hidden sm:inline text-slate-700 hover:underline uppercase">
              Trang chủ
            </li>
          </Link>

          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              {/* Avatar mở dropdown */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 transition"
              >
                <RxAvatar className="text-2xl text-gray-700" />
              </button>

              {/* Dropdown */}
              {isOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-md">
                  {currentUser.role === "USER" ? (
                    <ul className="py-2 text-sm text-gray-700">
                      <li>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 hover:bg-gray-100"
                        >
                          Thông tin cá nhân
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/profile/order"
                          className="block px-4 py-2 hover:bg-gray-100"
                        >
                          Đơn hàng của tôi
                        </Link>
                      </li>
                    </ul>
                  ) : (
                    <ul className="py-2 text-sm text-gray-700">
                      <li>
                        <Link
                          to="/admin/dashboard/product"
                          className="block px-4 py-2 hover:bg-gray-100"
                        >
                          Quản lý sản phẩm
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/admin/dashboard/variation"
                          className="block px-4 py-2 hover:bg-gray-100"
                        >
                          Quản lý biến thể
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/admin/dashboard/category"
                          className="block px-4 py-2 hover:bg-gray-100"
                        >
                          Quản lý danh mục
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/admin/dashboard/discount"
                          className="block px-4 py-2 hover:bg-gray-100"
                        >
                          Quản lý mã giảm giá
                        </Link>
                      </li>
                      <li>
                        <Link className="block px-4 py-2 hover:bg-gray-100">
                          Thống kê doanh thu
                        </Link>
                      </li>
                    </ul>
                  )}

                  <div className="border-t">
                    <span
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                    >
                      Đăng xuất
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/register">
              <li className="text-base text-slate-700 hover:underline uppercase">
                Đăng Ký
              </li>
            </Link>
          )}

          {/* Giỏ hàng */}
          <Link to="/cart">
            <div className="mt-1 text-base min-w-[30px] flex items-center justify-center rounded-full">
              <FiShoppingCart />
            </div>
          </Link>
        </ul>
      </div>
    </header>
  );
}
