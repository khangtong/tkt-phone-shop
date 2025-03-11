import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
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

export default function UpdateProduct() {
  const { id } = useParams();
  // eslint-disable-next-line no-unused-vars
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("products");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: [],
    category: "",
  });
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
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
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Không thể lấy danh mục");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    }
    fetchCategories();
  }, []);

  // Fetch thông tin sản phẩm
  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Không tìm thấy sản phẩm");
        const data = await res.json();

        // Set form data từ thông tin sản phẩm
        setFormData({
          name: data.name,
          description: data.description,
          category: data.category._id, // Sửa thành data.category._id
          image: data.image || [],
        });
      } catch (error) {
        console.error(error);
      }
    }
    fetchProduct();
  }, [id]);

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
          setFormData({ ...formData, image: [...formData.image, ...urls] });
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
    if (!id) {
      console.error("Không tìm thấy ID sản phẩm");
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      // Hiển thị thông báo thành công
      setShowToast(true);

      // Chuyển hướng sau 1 giây
      setTimeout(() => {
        navigate("/admin/dashboard/product");
      }, 1000);
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Hiển thị thông báo thành công */}
      {showToast && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 mt-5 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
              <HiCheck className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">
              Cập nhật sản phẩm thành công!
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

      <div className="w-4/5 p-6 flex justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-4xl">
          <h2 className="text-xl font-bold mb-4 text-center">
            Cập nhật sản phẩm
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              name="name"
              placeholder="Tên sản phẩm"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl"
            />
            <textarea
              name="description"
              placeholder="Mô tả"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl h-[120px]"
            />

            {/* Chọn danh mục */}
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl"
            >
              <option value="">Chọn danh mục</option>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))
              ) : (
                <option disabled>Đang tải danh mục...</option>
              )}
            </select>

            {/* Chọn file */}
            <div className="flex items-center gap-4">
              <input
                type="file"
                multiple
                onChange={(e) => setFiles([...e.target.files])}
                className="p-2 border rounded-xl"
              />
              <button
                type="button"
                onClick={handleImageUpload}
                disabled={uploading}
                className="p-2 bg-blue-500 text-white rounded-xl"
              >
                {uploading ? "Đang tải lên..." : "Tải ảnh lên"}
              </button>
            </div>

            {/* Hiển thị ảnh */}
            <div>
              <p className="text-lg font-semibold mt-4">Ảnh sản phẩm:</p>
              <div className="flex flex-wrap gap-3 mt-2">
                {formData.image.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      alt="product"
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2"
                      onClick={() => handleRemoveImage(index)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Nút cập nhật */}
            <button
              type="submit"
              className="w-full p-3 bg-green-500 text-white rounded-xl"
            >
              Cập nhật sản phẩm
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
