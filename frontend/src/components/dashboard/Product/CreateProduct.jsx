import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  addProductStart,
  addProductSuccess,
  addProductFailure,
} from "../../../redux/product/productSlice";
import Sidebar from "../../Sidebar";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../../../firebase";
import { Toast } from "flowbite-react";
import { HiCheck, HiX } from "react-icons/hi";

export default function CreateProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.product);
  const [activeTab, setActiveTab] = useState("products");
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: [],
    category: "",
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showToast, setShowToast] = useState(false); // State để hiển thị thông báo

  // Tự động ẩn thông báo sau 2 giây
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Fetch danh mục
  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    }
    fetchData();
  }, []);

  // Xử lý thay đổi giá trị trong form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý tải ảnh lên Firebase
  const handleImageUpload = () => {
    if (files.length > 0 && files.length + formData.image.length <= 6) {
      setUploading(true);
      const uploadPromises = files.map((file) => storeImage(file));

      Promise.all(uploadPromises)
        .then((urls) => {
          setFormData({
            ...formData,
            image: [...formData.image, ...urls],
          });
          setUploading(false);
        })
        .catch(() => {
          setError("Tải ảnh thất bại, vui lòng thử lại.");
          setUploading(false);
        });
    } else {
      setError("Chỉ có thể tải lên tối đa 6 ảnh.");
    }
  };

  // Lưu ảnh vào Firebase
  const storeImage = (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = `${new Date().getTime()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        null,
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  // Xóa ảnh
  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      image: formData.image.filter((_, i) => i !== index),
    });
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.image.length === 0) {
      setError("Bạn phải tải lên ít nhất một ảnh.");
      return;
    }
    dispatch(addProductStart());
    try {
      const res = await fetch("/api/products/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      dispatch(addProductSuccess(data));

      // Hiển thị thông báo thành công
      setShowToast(true);

      // Chuyển hướng sau 1 giây
      setTimeout(() => {
        navigate("/admin/dashboard/product");
      }, 1000);
    } catch (error) {
      dispatch(addProductFailure(error.message));
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Hiển thị thông báo thành công */}
      {showToast && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 mt-5 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
              <HiCheck className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">
              Thêm sản phẩm thành công!
            </div>
            <Toast.Toggle />
          </Toast>
        </div>
      )}

      {/* Hiển thị lỗi */}
      {error && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 mt-5 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
              <HiX className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">{error}</div>
            <Toast.Toggle />
          </Toast>
        </div>
      )}

      {/* Main Content */}
      <div className="w-4/5 p-6 flex justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-4xl">
          <h2 className="text-xl font-bold mb-4 text-center">Thêm sản phẩm</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thông tin sản phẩm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="name"
                placeholder="Tên sản phẩm"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl"
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              name="description"
              placeholder="Mô tả"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-xl h-[150px]"
            />

            <div className="space-y-4">
              <p className="font-semibold">Ảnh sản phẩm:</p>

              {/* Input chọn ảnh */}
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setFiles([...e.target.files])}
                  className="p-2 border rounded-lg"
                />
              </div>

              <button
                type="button"
                onClick={handleImageUpload}
                disabled={uploading}
                className="w-full p-3 bg-blue-500 text-white rounded-xl"
              >
                {uploading ? "Đang tải lên..." : "Tải ảnh lên"}
              </button>

              {/* Hiển thị danh sách ảnh đã tải lên */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 max-w-full">
                {formData.image.map((url, index) => (
                  <div
                    key={url}
                    className="relative group border-2 border-gray-400 rounded-lg p-1 w-full max-w-[90px] aspect-square overflow-hidden"
                  >
                    <img
                      src={url}
                      alt="product"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white text-xs rounded-full opacity-90 hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Nút thêm sản phẩm */}
            <button
              type="submit"
              className="w-full p-3 bg-green-500 text-white rounded-xl mt-4"
            >
              {loading ? "Đang tải..." : "Thêm sản phẩm"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
