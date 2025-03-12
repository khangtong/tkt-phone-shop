import { useEffect, useState } from "react";
import { Toast } from "flowbite-react";
import { HiCheck, HiX } from "react-icons/hi";
import { RxAvatar } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
} from "../redux/user/userSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const { currentUser, loading, error } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Fetch user data khi component mount
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(updateUserStart());
    try {
      const res = await fetch("/api/auth/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");

      dispatch(updateUserSuccess(data.user));
      setToastMessage("Cập nhật thành công!");
      setShowToast(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      setToastMessage(error.message);
      setShowToast(true);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10">
      {/* Hiển thị Toast thông báo */}
      {showToast && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 mt-5 z-50">
          <Toast>
            <div
              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                error
                  ? "bg-red-100 text-red-500"
                  : "bg-green-100 text-green-500"
              }`}
            >
              {error ? (
                <HiX className="h-5 w-5" />
              ) : (
                <HiCheck className="h-5 w-5" />
              )}
            </div>
            <div className="ml-3 text-sm font-normal">{toastMessage}</div>
            <Toast.Toggle />
          </Toast>
        </div>
      )}

      <div className="flex flex-col items-center mb-5">
        <RxAvatar className="w-20 h-20 text-gray-500" />
        <h1 className="text-3xl font-semibold mt-2">Thông tin cá nhân</h1>
      </div>
      <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Họ và tên
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            className="w-full p-2 border rounded-lg"
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Số điện thoại
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Địa chỉ
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <button
          type="submit"
          className="w-full p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          disabled={loading}
        >
          {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
