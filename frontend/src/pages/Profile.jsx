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

  const [formErrors, setFormErrors] = useState({
    email: "",
    phone: "",
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate fields as user types
    if (name === "email") {
      if (!value) {
        setFormErrors({ ...formErrors, email: "Email không được để trống" });
      } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(value)) {
        setFormErrors({
          ...formErrors,
          email: "Email phải có đuôi @gmail.com",
        });
      } else {
        setFormErrors({ ...formErrors, email: "" });
      }
    }

    if (name === "phone") {
      if (!value) {
        setFormErrors({
          ...formErrors,
          phone: "Số điện thoại không được để trống",
        });
      } else if (!/^\d{10,11}$/.test(value)) {
        setFormErrors({
          ...formErrors,
          phone: "Số điện thoại phải có 10-11 chữ số",
        });
      } else {
        setFormErrors({ ...formErrors, phone: "" });
      }
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...formErrors };

    if (!formData.email) {
      newErrors.email = "Email không được để trống";
      isValid = false;
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.email)) {
      newErrors.email = "Sai định dạng Email";
      isValid = false;
    }

    if (!formData.phone) {
      newErrors.phone = "Số điện thoại không được để trống";
      isValid = false;
    } else if (!/^\d{10,11}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại phải có 10-11 chữ số";
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setToastMessage("Vui lòng kiểm tra lại thông tin");
      setShowToast(true);
      return;
    }

    dispatch(updateUserStart());
    try {
      const res = await fetch("/api/auth/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");

      dispatch(
        updateUserSuccess({
          ...data.user,
          role: currentUser.role,
        })
      );

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
            onChange={handleChange}
            className={`w-full p-2 border rounded-lg ${
              formErrors.email ? "border-red-500" : ""
            }`}
          />
          {formErrors.email && (
            <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
          )}
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
            className={`w-full p-2 border rounded-lg ${
              formErrors.phone ? "border-red-500" : ""
            }`}
          />
          {formErrors.phone && (
            <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
          )}
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
          disabled={loading}
          className={`w-full p-2 text-white rounded-lg ${
            loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
