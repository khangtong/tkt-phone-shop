import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'flowbite-react';
import { HiCheck, HiX } from 'react-icons/hi';

export default function ForgotPassword() {
	const [formData, setFormData] = useState({ email: '', otp: '' });
	const [loading, setLoading] = useState({ sendingCode: false, verifyingOtp: false });
	const [countdown, setCountdown] = useState(0);
	const [toast, setToast] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		if (toast) {
			const timer = setTimeout(() => setToast(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [toast]);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.id]: e.target.value });
	};

	// Hàm gọi API và xử lý lỗi chung
	const fetchApi = async (url, body, type) => {
		try {
			setLoading((prev) => ({ ...prev, [type]: true }));
			const res = await fetch(url, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});

			const data = await res.json();
			if (!res.ok) {
				setToast({ type: 'error', message: data.message });
				setLoading((prev) => ({ ...prev, [type]: false }));
				return;
			}

			setToast({ type: 'success', message: data.message });
			return data;
		} catch (error) {
			console.error(error);
		}
	};

	// Gửi mã OTP
	const handleSendCode = async () => {
		if (!formData.email || loading.sendingCode) return;

		setCountdown(30);
		setTimeout(() => setLoading((prev) => ({ ...prev, sendingCode: false })), 30000);
		await fetchApi('/api/auth/forgot-password', { email: formData.email }, 'sendingCode');
	};

	// Đếm ngược thời gian gửi lại mã
	useEffect(() => {
		if (countdown > 0) {
			const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
			return () => clearInterval(timer);
		}
	}, [countdown]);

	// Xác thực mã OTP
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!formData.otp || loading.verifyingOtp) return;

		const data = await fetchApi('/api/auth/verify-otp', formData, 'verifyingOtp');
		if (data) {
			setTimeout(
				() =>
					navigate('/reset-password', {
						state: {
							email: formData.email,
							isSuccess: true,
						},
					}),
				1500,
			);
		}
	};

	return (
		<div className='max-w-sm mx-auto'>
			{/* Hiển thị thông báo */}
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

			<h1 className='text-3xl text-center font-semibold my-7'>Quên mật khẩu?</h1>
			<form onSubmit={handleSubmit} className='max-w-sm mx-auto'>
				<div className='mb-5'>
					<label className='block mb-1 text-sm font-medium text-gray-700 ml-1'>
						Email
					</label>
					<input
						type='email'
						id='email'
						className='shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 focus:outline-none'
						placeholder='Email'
						onChange={handleChange}
					/>
				</div>
				<div className='flex gap-4 w-full min-w-[100px] mb-5 items-end'>
					<div className='flex-1'>
						<label
							htmlFor='otp'
							className='block mb-1 text-sm font-medium text-gray-700 ml-1'>
							Mã xác nhận
						</label>
						<input
							id='otp'
							type='text'
							className='w-full bg-gray-50 border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5'
							onChange={handleChange}
							placeholder='Nhập mã xác nhận'
						/>
					</div>
					<button
						type='button'
						onClick={handleSendCode}
						disabled={!formData.email || loading.sendingCode}
						className={`h-[41.6px] px-4 py-2 text-white font-medium rounded-lg text-sm text-center shadow-xs uppercase transition-all
							${
								!formData.email || loading.sendingCode
									? 'bg-gray-400 cursor-not-allowed'
									: 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300'
							}`}>
						{loading.sendingCode ? `Gửi lại sau ${countdown}s` : 'Gửi mã'}
					</button>
				</div>

				<button
					disabled={!formData.otp || loading.verifyingOtp}
					className={`w-full p-2.5 text-white font-medium rounded-lg text-sm text-center shadow-xs uppercase 
						${
							!formData.otp
								? 'bg-gray-400 cursor-not-allowed'
								: 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300'
						}`}>
					{loading.verifyingOtp ? 'Đang xác thực...' : 'Đặt lại mật khẩu'}
				</button>
			</form>
		</div>
	);
}
