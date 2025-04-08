import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
	addDiscountStart,
	addDiscountSuccess,
	addDiscountFailure,
	resetState,
} from '../../../redux/discount/discountSlice';
import Sidebar from '../../Sidebar';
import { Toast } from 'flowbite-react';
import { HiCheck, HiX } from 'react-icons/hi';

export default function CreateDiscount() {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const { loading } = useSelector((state) => state.discount);
	const { currentUser } = useSelector((state) => state.user);

	const [toast, setToast] = useState(null);
	const [activeTab, setActiveTab] = useState('discounts');

	const [formData, setFormData] = useState({
		name: '',
		amount: '',
		startDate: '',
		endDate: '',
	});

	useEffect(() => {
		if (toast) {
			const timer = setTimeout(() => setToast(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [toast]);

	const handleChange = (e) => {
		const { name, value } = e.target;

		// Kiểm tra amount không được âm và không quá 100
		if (name === 'amount') {
			const parsedValue = parseFloat(value);
			if (parsedValue < 0 || parsedValue > 100) {
				setToast({
					type: 'error',
					message: 'Phần trăm giảm giá phải từ 1 đến 100!',
				});
				return;
			}
		}

		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const start = new Date(formData.startDate);
		const end = new Date(formData.endDate);

		if (start > end) {
			setToast({
				type: 'error',
				message: 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc!',
			});
			return;
		}

		dispatch(addDiscountStart());
		try {
			const res = await fetch('/api/discounts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${currentUser?.token}`,
				},
				body: JSON.stringify(formData),
			});
			const data = await res.json();
			if (!res.ok) {
				setToast({ type: 'error', message: data.message });
				dispatch(addDiscountFailure());
				return;
			}

			dispatch(addDiscountSuccess(data));
			setToast({ type: 'success', message: 'Tạo mã giảm giá thành công!' });

			setTimeout(() => {
				dispatch(resetState());
				navigate('/admin/dashboard/discount');
			}, 1000);
		} catch (error) {
			dispatch(addDiscountFailure());
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
					<h2 className='text-xl font-bold mb-4 text-center'>Thêm mã giảm giá</h2>

					<form onSubmit={handleSubmit} className='space-y-6'>
						<div className='grid grid-cols-1 gap-6'>
							<input
								type='text'
								name='name'
								placeholder='Tên mã giảm giá'
								value={formData.name}
								onChange={handleChange}
								required
								className='w-full p-3 border rounded-xl'
							/>
						</div>

						<div className='grid grid-cols-1 gap-6'>
							<input
								type='number'
								max={100}
								name='amount'
								placeholder='Phần trăm giảm giá'
								value={formData.amount}
								onChange={handleChange}
								required
								className='w-full p-3 border rounded-xl'
							/>
						</div>

						<div className='grid grid-cols-1 gap-6'>
							<input
								type='text'
								name='startDate'
								placeholder='Ngày bắt đầu'
								onFocus={(e) => (e.target.type = 'date')}
								onBlur={(e) => {
									if (!e.target.value) e.target.type = 'text';
								}}
								value={formData.startDate}
								onChange={handleChange}
								required
								className='w-full p-3 border rounded-xl'
							/>
						</div>
						<div className='grid grid-cols-1 gap-6'>
							<input
								type='text'
								name='endDate'
								onFocus={(e) => (e.target.type = 'date')}
								onBlur={(e) => {
									if (!e.target.value) e.target.type = 'text';
								}}
								placeholder='Ngày kết thúc'
								value={formData.endDate}
								onChange={handleChange}
								required
								className='w-full p-3 border rounded-xl'
							/>
						</div>
						<button
							type='submit'
							className='w-full p-3 bg-green-500 text-white rounded-xl mt-4'>
							{loading ? 'Đang tải...' : 'Thêm mã giảm giá'}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
