import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../Sidebar';
import { FaEdit, FaSearch, FaTrash } from 'react-icons/fa';
import { IoAddOutline } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import CustomModalConfirm from '../../CustomModal';

export default function CategoryDashboard() {
	const [activeTab, setActiveTab] = useState('categories');
	const [openModal, setOpenModal] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [categories, setCategories] = useState([]);
	const [filteredCategories, setFilteredCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const { currentUser } = useSelector((state) => state.user);
	const [toast, setToast] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 8;
	const [categoryID, setCategoryID] = useState('');

	const fetchCategories = async () => {
		setLoading(true);
		try {
			const response = await fetch('/api/categories');
			if (!response.ok) throw new Error('Lỗi khi lấy danh mục');
			const data = await response.json();

			setCategories(data);
			setFilteredCategories(data);
		} catch (error) {
			console.error(error);
		}
		setLoading(false);
	};

	const handleDeleteCategory = async (categoryID) => {
		setOpenModal(false);
		try {
			const res = await fetch(`/api/categories/${categoryID}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${currentUser.token}`,
				},
			});

			if (!res.ok) {
				const errorData = await res.json();
				setToast({ type: 'error', message: errorData.message });
				return;
			}

			setCategories((prev) => prev.filter((category) => category._id !== categoryID));
			setFilteredCategories((prev) => prev.filter((category) => category._id !== categoryID));
			setToast({ type: 'success', message: 'Xóa danh mục thành công!' });

			setTimeout(() => setToast(null), 3000);
		} catch (error) {
			setToast({ type: 'error', message: 'Lỗi khi xóa danh mục.' });
		}
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	useEffect(() => {
		if (searchTerm) {
			const filtered = categories.filter((category) =>
				category.name.toLowerCase().includes(searchTerm.toLowerCase()),
			);
			setFilteredCategories(filtered);
		} else {
			setFilteredCategories(categories);
		}
		setCurrentPage(1);
	}, [searchTerm, categories]);

	const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
	const currentCategories = filteredCategories.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
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
								placeholder='Tìm kiếm danh mục...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='w-full p-2 pl-10 border rounded-lg'
							/>
							<FaSearch className='absolute left-3 top-3 text-gray-400' />
						</div>
						<Link to={'/admin/dashboard/category/add'}>
							<button className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center'>
								<IoAddOutline className='mr-1 text-lg' />
								Thêm danh mục mới
							</button>
						</Link>
					</div>

					<div className='overflow-x-auto'>
						{loading ? (
							<p className='text-center text-gray-500'>Đang tải dữ liệu...</p>
						) : filteredCategories.length > 0 ? (
							<>
								<table className='w-full border-collapse bg-white'>
									<thead>
										<tr className='bg-gray-200 text-left'>
											<th className='p-3'>STT</th>
											<th className='p-3'>Tên danh mục</th>
											<th className='p-3'>Logo</th>
											<th className='p-3'>Hành động</th>
										</tr>
									</thead>
									<tbody>
										{currentCategories.map((category, index) => (
											<tr key={category._id} className='border-t'>
												<td className='p-3'>
													{(currentPage - 1) * itemsPerPage + index + 1}
												</td>
												<td className='p-3'>{category.name}</td>
												<td className='p-3'>
													<img
														src={category.logo}
														alt={category.name}
														className='h-auto w-[140px] object-cover rounded-md border'
													/>
												</td>
												<td className='p-3 flex space-x-2'>
													<Link
														to={`/admin/dashboard/category/update/${category._id}`}>
														<button className='bg-green-500 p-2 text-white rounded-lg'>
															<FaEdit />
														</button>
													</Link>
													<button
														className='bg-red-500 p-2 text-white rounded-lg'
														onClick={() => {
															setOpenModal(true);
															setCategoryID(category._id);
														}}>
														<FaTrash />
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>

								<div className='flex justify-center mt-6'>
									{Array.from({ length: totalPages }, (_, i) => i + 1).map(
										(page) => (
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
										),
									)}
								</div>
							</>
						) : (
							<tr>
								<td colSpan='4' className='text-center p-4 text-gray-500'>
									Không tìm thấy danh mục nào.
								</td>
							</tr>
						)}

						<CustomModalConfirm
							openModal={openModal}
							onClose={() => setOpenModal(false)}
							textConfirm={
								'Bạn chắc chắc muốn xoá danh mục này? Nếu xoá danh mục sẽ xoá tất cả sản phẩm thuộc danh mục này!'
							}
							performAction={() => handleDeleteCategory(categoryID)}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
