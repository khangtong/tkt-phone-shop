import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../Sidebar';
import { Toast } from 'flowbite-react';
import { HiCheck, HiX } from 'react-icons/hi';

export default function UpdateDiscount() {
	const { id } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [toast, setToast] = useState(null);
	const { currentUser } = useSelector((state) => state.user);
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

	const formatDateFromISO = (isoString) => {
		if (!isoString) return '';
		const date = new Date(isoString);
		const day = date.getDate().toString().padStart(2, '0');
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const year = date.getFullYear();
		return `${year}-${month}-${day}`;
	};

	useEffect(() => {
		async function fetchDiscount() {
			if (!id) return;
			try {
				const res = await fetch(`/api/discounts/${id}`);
				if (!res.ok) throw new Error('Không tìm thấy mã giảm giá');
				const data = await res.json();

				setFormData({
					name: data.discount.name,
					amount: data.discount.amount,
					startDate: formatDateFromISO(data.discount.startDate),
					endDate: formatDateFromISO(data.discount.endDate),
				});
			} catch (error) {
				console.error(error);
			}
		}
		fetchDiscount();
	}, [id]);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
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
		try {
			const res = await fetch(`/api/discounts/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${currentUser?.token}`,
				},
				body: JSON.stringify(formData),
			});
			const data = await res.json();

			if (!res.ok) {
				setToast({ type: 'error', message: data.message });
				throw new Error(data.message);
			}

			setToast({ type: 'success', message: data.message });

			setTimeout(() => {
				navigate('/admin/dashboard/discount');
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
					<h2 className='text-xl font-bold mb-4 text-center'>Cập nhật mã giảm giá</h2>

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
								type='date'
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
								type='date'
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
							{'Cập nhật mã giảm giá'}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
