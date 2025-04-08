import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../Sidebar';
import { FaEdit, FaSearch, FaTrash } from 'react-icons/fa';
import { IoAddOutline } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import CustomModalConfirm from '../../CustomModal';
import { Toast } from 'flowbite-react';
import { HiCheck, HiX } from 'react-icons/hi';

export default function DiscountDashboard() {
	const [activeTab, setActiveTab] = useState('discounts');
	const [openModal, setOpenModal] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [discounts, setDiscounts] = useState([]);
	const [discountId, setDiscountId] = useState('');
	const [filteredDiscounts, setFilteredDiscounts] = useState([]);
	const [loading, setLoading] = useState(false);
	const { currentUser } = useSelector((state) => state.user);
	const [toast, setToast] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 8;

	const fetchDiscounts = async () => {
		setLoading(true);
		try {
			const response = await fetch('/api/discounts');
			if (!response.ok) throw new Error('Lỗi khi lấy mã giảm giá');
			const data = await response.json();

			setDiscounts(data.discounts);
			setFilteredDiscounts(data.discounts);
		} catch (error) {
			console.error(error);
		}
		setLoading(false);
	};

	const handleDeleteDiscount = async (discountID) => {
		setOpenModal(false);
		try {
			const res = await fetch(`/api/discounts/${discountID}`, {
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

			setDiscounts((prev) => prev.filter((discount) => discount._id !== discountID));
			setFilteredDiscounts((prev) => prev.filter((discount) => discount._id !== discountID));

			setToast({ type: 'success', message: 'Xóa mã giảm giá thành công!' });

			setTimeout(() => setToast(null), 3000);
		} catch (error) {
			setToast({ type: 'error', message: 'Lỗi khi xóa mã giảm giá.' });
		}
	};

	useEffect(() => {
		fetchDiscounts();
	}, []);

	useEffect(() => {
		if (searchTerm) {
			const filtered = discounts.filter((discount) =>
				discount.name.toLowerCase().includes(searchTerm.toLowerCase()),
			);
			setFilteredDiscounts(filtered);
		} else {
			setFilteredDiscounts(discounts);
		}
		setCurrentPage(1);
	}, [searchTerm, discounts]);

	const totalPages = Math.ceil(filteredDiscounts.length / itemsPerPage);
	const currentDiscounts = filteredDiscounts.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	const formatDateFromISO = (isoString) => {
		if (!isoString) return '';

		const date = new Date(isoString);
		return date.toLocaleDateString('vi-VN');
	};

	const goToPage = (page) => {
		setCurrentPage(page);
	};

	return (
		<div className='flex h-screen bg-gray-100'>
			<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

			<div className='w-4/5 p-6'>
				<div className='bg-white p-6 rounded-xl shadow-lg'>
					{toast && (
						<div className='fixed top-0 left-1/2 -translate-x-1/2 mt-5 z-50'>
							<Toast>
								<div
									className={`inline-flex h-8 w-8 items-center justify-center rounded-lg 
                          ${
								toast.type === 'success'
									? 'bg-green-100 text-green-500'
									: 'bg-red-100 text-red-500'
							}`}>
									{toast.type === 'success' ? (
										<HiCheck className='h-5 w-5' />
									) : (
										<HiX className='h-5 w-5' />
									)}
								</div>
								<div className='ml-3 text-sm font-normal'>{toast.message}</div>
								<Toast.Toggle />
							</Toast>
						</div>
					)}

					<div className='flex justify-between items-center mb-4'>
						<div className='relative w-1/3'>
							<input
								type='text'
								placeholder='Tìm kiếm mã giảm giá...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='w-full p-2 pl-10 border rounded-lg'
							/>
							<FaSearch className='absolute left-3 top-3 text-gray-400' />
						</div>
						<Link to={'/admin/dashboard/discount/add'}>
							<button className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center'>
								<IoAddOutline className='mr-1 text-lg' />
								Thêm mã giảm giá mới
							</button>
						</Link>
					</div>

					<div className='overflow-x-auto'>
						{loading ? (
							<p className='text-center text-gray-500'>Đang tải dữ liệu...</p>
						) : filteredDiscounts.length > 0 ? (
							<>
								<table className='w-full border-collapse bg-white'>
									<thead>
										<tr className='bg-gray-200 text-left'>
											<th className='p-3'>STT</th>
											<th className='p-3'>Tên mã giảm giá</th>
											<th className='p-3'>Phần trăm giảm giá</th>
											<th className='p-3'>Ngày bắt đầu</th>
											<th className='p-3'>Ngày kết thúc</th>
											<th className='p-3'>Hành động</th>
										</tr>
									</thead>
									<tbody>
										{currentDiscounts.map((discount, index) => (
											<tr key={discount._id} className='border-t'>
												<td className='p-3'>
													{(currentPage - 1) * itemsPerPage + index + 1}
												</td>
												<td className='p-3'>
													{discount.name.toUpperCase()}
												</td>
												<td className='p-3'>{discount.amount}</td>
												<td className='p-3'>
													{formatDateFromISO(discount.startDate)}
												</td>
												<td className='p-3'>
													{formatDateFromISO(discount.endDate)}
												</td>
												<td className='p-3 flex space-x-2'>
													<Link
														to={`/admin/dashboard/discount/update/${discount._id}`}>
														<button className='bg-green-500 p-2 text-white rounded-lg'>
															<FaEdit />
														</button>
													</Link>
													<button
														className='bg-red-500 p-2 text-white rounded-lg'
														onClick={() => {
															setOpenModal(true);
															setDiscountId(discount._id);
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
							<table className='w-full border-collapse bg-white'>
								<tbody>
									<tr>
										<td colSpan='6' className='text-center p-4 text-gray-500'>
											Không tìm thấy mã giảm giá nào.
										</td>
									</tr>
								</tbody>
							</table>
						)}

						<CustomModalConfirm
							openModal={openModal}
							onClose={() => setOpenModal(false)}
							textConfirm={'Bạn chắc chắc muốn xoá mã giảm giá này?'}
							performAction={() => handleDeleteDiscount(discountId)}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
