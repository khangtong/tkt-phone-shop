import { Link, useNavigate, useLocation } from 'react-router-dom';
import { RxAvatar } from 'react-icons/rx';
import { FiShoppingCart } from 'react-icons/fi';
import { GrSearch } from 'react-icons/gr';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useRef, useEffect } from 'react';
import { logout } from '../redux/user/userSlice';
import { clearCart } from '../redux/cart/cartSlice';
import { Toast } from 'flowbite-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const { totalQuantity: cartQuantity = 0 } =
    useSelector((state) => state.cart) || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Hàm đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Đóng dropdown khi route thay đổi
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart()); // Thêm dòng này
    localStorage.removeItem('token'); // Thêm dòng này
    // Toast.success('Đã đăng xuất thành công!');
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchValue = e.target[0].value.trim();
    if (searchValue) {
      navigate(`/search?name=${encodeURIComponent(searchValue)}`);
    } else {
      Toast.error('Vui lòng nhập từ khóa tìm kiếm!');
    }
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
        <form
          onSubmit={handleSearch}
          className="flex items-center w-full justify-center max-w-sm"
        >
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-1 rounded-l-md border-none focus:outline-0"
            required={true}
          />
          <button
            type="submit"
            className="text-base min-w-[80px] h-8 bg-blue-600 flex items-center justify-center rounded-r-md text-white"
          >
            <GrSearch />
            <span className="text-xs sm:text-xs hidden sm:inline">
              Tìm kiếm
            </span>
          </button>
        </form>

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
                  {currentUser.role === 'USER' ? (
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
                          to="/admin/dashboard/order"
                          className="block px-4 py-2 hover:bg-gray-100"
                        >
                          Quản lý đơn hàng
                        </Link>
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
                        <Link
                          to="/admin/dashboard/revenue"
                          className="block px-4 py-2 hover:bg-gray-100"
                        >
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
            <Link to="/login">
              <li className="text-base text-slate-700 hover:underline uppercase">
                Đăng Nhập
              </li>
            </Link>
          )}

          {/* Giỏ hàng */}
          <Link to="/cart">
            <div className="relative mt-1 text-base min-w-[30px] flex items-center justify-center rounded-full">
              <FiShoppingCart />
              {cartQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cartQuantity}
                </span>
              )}
            </div>
          </Link>
        </ul>
      </div>
    </header>
  );
}
