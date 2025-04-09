import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../Sidebar";
import { FaSearch, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { IoAddOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import CustomModalConfirm from "../../CustomModal";

export default function ProductDashboard() {
  const [activeTab, setActiveTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [openModal, setOpenModal] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Lỗi khi lấy sản phẩm");
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleDeleteProduct = async (productID) => {
    try {
      const res = await fetch(`/api/products/${productID}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        setToast({ type: "error", message: errorData.message });
        return;
      }

      setProducts((prev) =>
        prev.filter((product) => product._id !== productID)
      );
      setFilteredProducts((prev) =>
        prev.filter((product) => product._id !== productID)
      );
      setToast({ type: "success", message: "Xóa sản phẩm thành công!" });

      // Đóng modal sau khi xóa thành công
      setOpenModal(false);

      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({ type: "error", message: "Lỗi khi xóa sản phẩm." });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Lỗi khi lấy danh mục");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
    setCurrentPage(1);
  }, [searchTerm, products]);

  const getCategoryName = (category) => {
    const categoryId = typeof category === "object" ? category._id : category;
    const foundCategory = categories.find((cat) => cat._id === categoryId);
    return foundCategory ? foundCategory.name : "Không xác định";
  };

  const truncateText = (text, length) => {
    return text.length > length ? text.slice(0, length) + "..." : text;
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  return (
		<div className='flex h-screen bg-gray-100'>
			<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

			<div className='w-4/5 p-6'>
				<div className='bg-white p-6 rounded-xl shadow-lg'>
					{toast && (
						<div
							className={`fixed top-5 z-[1001] right-5 p-4 rounded-lg shadow-lg text-white ${
								toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
							}`}>
							{toast.message}
						</div>
					)}

					<div className='flex justify-between items-center mb-4'>
						<div className='relative w-1/3'>
							<input
								type='text'
								placeholder='Tìm kiếm sản phẩm...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='w-full p-2 pl-10 border rounded-lg'
							/>
							<FaSearch className='absolute left-3 top-3 text-gray-400' />
						</div>
						<Link to={'/admin/dashboard/product/add'}>
							<button className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center'>
								<IoAddOutline className='mr-1 text-lg' />
								Thêm sản phẩm mới
							</button>
						</Link>
					</div>

					<div className='overflow-x-auto'>
						{loading ? (
							<p className='text-center text-gray-500'>Đang tải dữ liệu...</p>
						) : (
							<table className='w-full border-collapse bg-white'>
								<thead>
									<tr className='bg-gray-200 text-left'>
										<th className='p-3'>STT</th>
										<th className='p-3'>Tên sản phẩm</th>
										<th className='p-3'>Mô tả</th>
										<th className='p-3'>Danh mục</th>
										<th className='p-3'>Hình ảnh</th>
										<th className='p-3'>Hành động</th>
									</tr>
								</thead>
								<tbody>
									{filteredProducts.length > 0 ? (
										currentProducts.map((product, index) => (
											<tr key={product._id} className='border-t'>
												<td className='p-3'>
													{(currentPage - 1) * itemsPerPage + index + 1}
												</td>
												<td className='p-3'>{product.name}</td>
												<td className='p-3'>
													{truncateText(product.description, 10)}
												</td>
												<td className='p-3'>
													{getCategoryName(product.category)}
												</td>
												<td className='p-3'>
													{product.image?.length > 0 ? (
														<img
															src={product.image[0]}
															alt={product.name}
															className='w-12 h-12 object-cover rounded-md border'
														/>
													) : (
														'Không có ảnh'
													)}
												</td>
												<td className='p-3 flex space-x-2'>
													<Link to={`/product/${product._id}`}>
														<button className='bg-blue-500 p-2 text-white rounded-lg'>
															<FaEye />
														</button>
													</Link>
													<Link
														to={`/admin/dashboard/product/update/${product._id}`}>
														<button className='bg-green-500 p-2 text-white rounded-lg'>
															<FaEdit />
														</button>
													</Link>
													<button
														className='bg-red-500 p-2 text-white rounded-lg'
														onClick={() => {
															setOpenModal(true);
															setProductIdToDelete(product._id);
														}}>
														<FaTrash />
													</button>
												</td>
											</tr>
										))
									) : (
										<tr>
											<td
												colSpan='6'
												className='text-center p-4 text-gray-500'>
												Không tìm thấy sản phẩm nào.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						)}

						{filteredProducts.length > 0 && (
							<div className='flex justify-center mt-6'>
								{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
									<button
										key={page}
										onClick={() => goToPage(page)}
										className={`mx-1 px-4 py-2 rounded-lg ${
											currentPage === page
												? 'bg-blue-600 text-white'
												: 'bg-gray-200 text-gray-700'
										}`}>
										{page}
									</button>
								))}
							</div>
						)}
					</div>

					<CustomModalConfirm
						openModal={openModal}
						onClose={() => setOpenModal(false)}
						textConfirm={'Bạn chắc chắc muốn xoá sản phẩm này?'}
						performAction={() => handleDeleteProduct(productIdToDelete)}
					/>
				</div>
			</div>
		</div>
  );
}
