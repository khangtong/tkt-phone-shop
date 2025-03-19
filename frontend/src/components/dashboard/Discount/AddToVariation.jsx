import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../Sidebar';
import { Toast } from 'flowbite-react';
import { HiCheck, HiX } from 'react-icons/hi';

export default function AddToVariation() {
	const navigate = useNavigate();
	const location = useLocation();
	const { loading } = useSelector((state) => state.discount);
	const { currentUser } = useSelector((state) => state.user);

	const [toast, setToast] = useState(null);
	const [activeTab, setActiveTab] = useState('discounts');
	const [discounts, setDiscounts] = useState([]);
	const [variations, setVariations] = useState([]);
	const [variationIds, setVariationsIds] = useState([]);
	const [selectedDiscount, setSelectedDiscount] = useState('');

	useEffect(() => {
		if (toast) {
			const timer = setTimeout(() => setToast(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [toast]);

	async function fetchDiscounts() {
		try {
			const res = await fetch('/api/discounts');

			if (!res.ok) {
				setToast({ type: 'error', message: 'Không thể lấy danh sách discount' });
				return;
			}
			const data = await res.json();
			setDiscounts(data.discounts);
		} catch (error) {
			console.error('Lỗi khi lấy danh sách discount:', error.message);
		}
	}
	// Gán variationsId đúng 1 lần khi load trang
	useEffect(() => {
		if (location.state.selectedId) {
			setVariationsIds(location.state.selectedId);
		}
	}, [location.state.selectedId]);

	// Gọi API variations khi variationsId sẵn sàng
	useEffect(() => {
		async function fetchMultipleVariations() {
			try {
				const promises = variationIds.map((id) =>
					fetch(`/api/variations/${id}`).then((res) => res.json()),
				);

				const results = await Promise.all(promises);

				setVariations(results);
			} catch (error) {
				console.error('Lỗi khi lấy nhiều biến thể:', error.message);
				setToast({ type: 'error', message: 'Không thể lấy thông tin biến thể' });
			}
		}

		if (variationIds.length > 0) {
			fetchMultipleVariations();
		}
	}, [variationIds]);

	useEffect(() => {
		fetchDiscounts();
	}, []);

	const handleDiscountChange = (e) => {
		setSelectedDiscount(e.target.value);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const res = await fetch('/api/discounts/add/variation', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${currentUser?.token}`,
				},
				body: JSON.stringify({
					discountId: selectedDiscount,
					variationIds: variationIds,
				}),
			});
			const data = await res.json();
			if (!res.ok) {
				setToast({ type: 'error', message: data.message });
				return;
			}

			setToast({ type: 'success', message: 'Thêm mã cho biến thể thành công!' });

			setTimeout(() => {
				navigate('/admin/dashboard/discount/variation');
			}, 1000);
		} catch (error) {
			setToast({ type: 'error', message: error.message });
		}
	};

	return (
		<div className='flex h-screen bg-gray-100'>
			<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

			{toast && (
				<div className='fixed top-0 left-1/2 -translate-x-1/2 mt-5 z-50'>
					<Toast>
						<div
							className={`inline-flex h-8 w-8 items-center justify-center rounded-lg 
									${toast.type === 'success' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
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

			<div className='w-4/5 p-6 flex justify-center'>
				<div className='bg-white p-6 rounded-2xl shadow-lg w-full max-w-4xl'>
					<h2 className='text-xl font-bold mb-4 text-center'>
						Áp mã giảm giá cho biến thể
					</h2>

					<form onSubmit={handleSubmit} className='space-y-6'>
						<select
							name='discountId'
							value={selectedDiscount}
							onChange={handleDiscountChange}
							required
							className='w-full p-3 border rounded-xl'>
							<option value=''>Chọn mã giảm giá</option>
							{discounts.map((discount) => (
								<option key={discount._id} value={discount._id}>
									{discount.name}
								</option>
							))}
						</select>

						<div className='mb-6 space-y-4'>
							<h3 className='font-semibold text-gray-700 text-lg'>
								Các biến thể sẽ áp dụng mã giảm giá:
							</h3>

							<div className='max-h-96 overflow-y-auto space-y-4 pr-2'>
								{variations.map((item) => (
									<div
										key={item._id}
										className='p-4 border rounded-xl bg-gray-50'>
										<p>
											<strong>Tên: </strong>
											{item.product.name}
										</p>
										<p>
											<strong>Màu: </strong>
											{item.color}
										</p>
										<p>
											<strong>RAM: </strong>
											{item.ram}
										</p>
										<p>
											<strong>Bộ nhớ: </strong>
											{item.rom}
										</p>
										<p>
											<strong>Giá: </strong>
											{item.price.toLocaleString('vi-VN')} VNĐ
										</p>
										<p>
											<strong>Giảm giá: </strong>
											{item.discount?.name || 'Không có'}
										</p>
									</div>
								))}
							</div>
						</div>
						<button
							type='submit'
							className='w-full p-3 bg-green-500 text-white rounded-xl mt-4'>
							{loading ? 'Đang tải...' : 'Thêm mã giảm giá cho biến thể'}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
