import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../Sidebar';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../../../firebase';
import { Toast } from 'flowbite-react';
import { HiCheck, HiX } from 'react-icons/hi';

export default function UpdateCategory() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('categories');
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Fetch category data
  useEffect(() => {
    async function fetchCategory() {
      if (!id) return;
      try {
        const res = await fetch(`/api/categories/${id}`);
        if (!res.ok) throw new Error('Không tìm thấy danh mục');
        const data = await res.json();

        setFormData({
          name: data.name,
          logo: data.logo,
        });
      } catch (error) {
        console.error(error);
      }
    }
    fetchCategory();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async () => {
    if (file) {
      try {
        setUploading(true);
        const url = await storeImage(file);
        setFormData({ ...formData, logo: url });
        setUploading(false);
      } catch (error) {
        setError('Tải ảnh thất bại');
        setUploading(false);
      }
    } else {
      setError('Vui lòng chọn ảnh logo');
    }
  };

  const storeImage = (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = `${new Date().getTime()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        null,
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, logo: '' });
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) {
      console.error('Missing category ID');
      return;
    }

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      setShowToast(true);
      setTimeout(() => {
        navigate('/admin/dashboard/category');
      }, 1000);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {showToast && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 mt-5 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500">
              <HiCheck className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">
              Cập nhật danh mục thành công!
            </div>
            <Toast.Toggle />
          </Toast>
        </div>
      )}

      {error && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 mt-5 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500">
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
            Cập nhật danh mục
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              name="name"
              placeholder="Tên danh mục"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl"
              required
            />

            <div className="space-y-4">
              <p className="font-semibold">Logo:</p>

              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="p-2 border rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={uploading}
                  className="p-2 bg-blue-500 text-white rounded-xl"
                >
                  {uploading ? 'Đang tải lên...' : 'Tải logo lên'}
                </button>
              </div>

              {formData.logo && (
                <div className="relative group border-2 border-gray-400 rounded-lg p-1 w-full max-w-[90px] aspect-square overflow-hidden">
                  <img
                    src={formData.logo}
                    alt="category logo"
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white text-xs rounded-full opacity-90 hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-green-500 text-white rounded-xl"
            >
              Cập nhật danh mục
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
