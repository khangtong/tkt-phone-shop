import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Label, Radio, Toast } from 'flowbite-react';
import vnpay_icon from '../assets/icon/vnpay.jpg';
import cod_icon from '../assets/icon/cod.png';
import { HiCheck, HiX } from 'react-icons/hi';

export default function Checkout() {
	const [formData, setFormData] = useState({
		fullName: '',
		phone: '',
		email: '',
		address: '',
		paymentMethod: 'COD',
	});
	const navigate = useNavigate();
	const cart = useSelector((state) => state.cart);
	const [errors, setErrors] = useState({});
	const [toast, setToast] = useState(null);
	const location = useLocation();

	useEffect(() => {
		if (toast) {
			const timer = setTimeout(() => setToast(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [toast]);

	useEffect(() => {
		if (!location.state?.canAccessCheckout) {
			navigate('/');
		}
	}, [navigate]);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleRadioChange = (e) => {
		setFormData({ ...formData, paymentMethod: e.target.value });
	};

	const validateForm = () => {
		const newErrors = {};
		if (!formData.fullName) newErrors.fullName = 'Vui lòng nhập họ tên.';
		if (!formData.phone) newErrors.phone = 'Vui lòng nhập số điện thoại.';
		if (!formData.email) newErrors.email = 'Vui lòng nhập email.';
		if (!formData.address) newErrors.address = 'Vui lòng nhập địa chỉ.';
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (validateForm()) {
			try {
				if (formData.paymentMethod === 'VNPAY') {
					// Gọi API thanh toán VNPay
					const res = await fetch('/api/payment/vnpay-payment', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
					});

					const data = await res.json();

					if (data.success) {
						setToast({ type: 'success', message: 'Đang chuyển hướng đến VNPay...' });
						setTimeout(() => {
							window.location.href = data.vnpayUrl; // Chuyển hướng đến VNPay sau 2s
						}, 2000);
					} else {
						setToast({ type: 'error', message: data.message });
					}
				} else if (formData.paymentMethod === 'COD') {
					// Gọi API thanh toán COD
					const res = await fetch('/api/payment/cod-payment', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
					});

					const data = await res.json();
					console.log(data);

					if (data.success) {
						setToast({
							type: 'success',
							message: 'Thanh toán thành công! Đang chuyển trang...',
						});
						setTimeout(() => {
							navigate(`/payment-success/${data.paymentId}`); // Chuyển hướng sau 3s
						}, 3000);
					} else {
						setToast({ type: 'error', message: data.message });
					}
				}
			} catch (error) {
				console.error('Lỗi khi gọi API thanh toán:', error);
				setToast({ type: 'error', message: 'Đã xảy ra lỗi, vui lòng thử lại!' });
			}
		}
	};

	return (
		<div className='max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-xl mt-12'>
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

			<h1 className='text-3xl font-bold text-center text-gray-900'>Thông Tin Đặt Hàng</h1>
			<form onSubmit={handleSubmit} className='mt-8 space-y-6'>
				{/* Thông tin cá nhân */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					<div>
						<label className='block text-gray-700 font-medium'>Họ Tên</label>
						<input
							type='text'
							name='fullName'
							value={formData.fullName}
							onChange={handleChange}
							className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm'
						/>
						{errors.fullName && (
							<p className='text-red-500 text-sm mt-1'>{errors.fullName}</p>
						)}
					</div>
					<div>
						<label className='block text-gray-700 font-medium'>Số Điện Thoại</label>
						<input
							type='text'
							name='phone'
							value={formData.phone}
							onChange={handleChange}
							className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm'
						/>
						{errors.phone && (
							<p className='text-red-500 text-sm mt-1'>{errors.phone}</p>
						)}
					</div>
				</div>
				<div>
					<label className='block text-gray-700 font-medium'>Email</label>
					<input
						type='email'
						name='email'
						value={formData.email}
						onChange={handleChange}
						className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm'
					/>
					{errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email}</p>}
				</div>
				<div>
					<label className='block text-gray-700 font-medium'>Địa Chỉ Giao Hàng</label>
					<input
						type='text'
						name='address'
						value={formData.address}
						onChange={handleChange}
						className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm'
					/>
					{errors.address && (
						<p className='text-red-500 text-sm mt-1'>{errors.address}</p>
					)}
				</div>

				{/* Phương thức thanh toán */}
				<div className='bg-gray-50 p-4 rounded-lg shadow'>
					<label className='block text-lg font-medium text-gray-700'>
						Hình Thức Thanh Toán
					</label>
					<div className='flex flex-col gap-4 mt-3'>
						<div className='flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-100 cursor-pointer'>
							<Radio
								id='cod'
								name='payments'
								value='COD'
								defaultChecked
								onClick={handleRadioChange}
							/>
							<Label htmlFor='cod' className='text-gray-700 flex items-center gap-2'>
								<img src={cod_icon} alt='COD' className='w-6' />
								Thanh toán khi nhận hàng
							</Label>
						</div>
						<div className='flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-100 cursor-pointer'>
							<Radio
								id='vnpay'
								name='payments'
								value='VNPAY'
								onClick={handleRadioChange}
							/>
							<Label
								htmlFor='vnpay'
								className='text-gray-700 flex items-center gap-2'>
								<img src={vnpay_icon} alt='VNPay' className='w-6' />
								Thanh toán qua VNPay
							</Label>
						</div>
					</div>
				</div>

				{/* Tóm tắt đơn hàng */}
				<div className='bg-gray-100 p-5 rounded-lg shadow-lg'>
					<h2 className='text-xl font-semibold'>Tóm Tắt Đơn Hàng</h2>
					<ul className='space-y-2'>
						{cart?.items?.length > 0 ? (
							cart.items.map((item, index) => {
								const discountValid =
									item.discount &&
									new Date(item.discount.startDate) <= new Date() &&
									new Date(item.discount.endDate) >= new Date();

								const discountedPrice = discountValid
									? Math.round(item.price * (1 - item.discount.amount / 100))
									: item.price;

								return (
									<li key={index} className='flex justify-between'>
										<span>{item.product.name}</span>
										<span>
											{item.quantity} x {discountedPrice.toLocaleString()}₫
										</span>
									</li>
								);
							})
						) : (
							<p className='text-center text-gray-500'>Giỏ hàng trống</p>
						)}
					</ul>
					<p className='text-right font-bold text-lg mt-4 text-red-600'>
						Tổng Tiền: {cart.totalPrice.toLocaleString()}₫
					</p>
				</div>

				{/* Nút xác nhận */}
				<button
					type='submit'
					className='w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition text-lg shadow-lg'>
					Xác Nhận Đặt Hàng
				</button>
			</form>
		</div>
	);
}
