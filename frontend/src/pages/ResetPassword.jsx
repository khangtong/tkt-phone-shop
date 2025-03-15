import React, { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Toast } from 'flowbite-react';
import { HiCheck, HiX } from 'react-icons/hi';

export default function ResetPassword() {
	const [formData, setFormData] = useState({
		email: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [loading, setLoading] = useState(false);
	const [toast, setToast] = useState(null);
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		if (toast) {
			const timer = setTimeout(() => setToast(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [toast]);

	useEffect(() => {
		if (!location.state?.isSuccess) {
			navigate('/');
		}
		if (location.state?.email) {
			setFormData((prev) => ({ ...prev, email: location.state.email }));
		}
	}, [location.state?.email]);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.id]: e.target.value,
		});
	};
	const validateValue = Object.values(formData).every((el) => el);

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			setLoading(true);
			const res = await fetch('/api/auth/reset-password', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			const data = await res.json();

			if (!res.ok) {
				setToast({ type: 'error', message: data.message });
				setLoading(false);
				return;
			}

			setToast({ type: 'success', message: data.message });
			setTimeout(() => {
				navigate('/login');
			}, 1500);
		} catch (error) {
			setToast({ type: 'error', message: error.message });
			throw new Error(error.message);
		}
	};

	return (
		<div className='max-w-sm mx-auto'>
			{/* Hiển thị thông báo ở trên cùng */}
			{toast && (
				<div className='fixed top-0 left-1/2 -translate-x-1/2 mt-5 z-50'>
					<Toast>
						<div
							className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
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

			<h1 className='text-3xl text-center font-semibold my-7'>Đặt lại mật khẩu</h1>
			<form onSubmit={handleSubmit} className='max-w-sm mx-auto'>
				<div className='mb-5'>
					<label className='block mb-1 text-sm font-medium text-gray-700 ml-1'>
						Mật khẩu mới
					</label>
					<input
						type='password'
						id='newPassword'
						className='shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 focus:outline-none'
						placeholder='Mật khẩu mới'
						onChange={handleChange}
						required
					/>
				</div>
				<div className='mb-5'>
					<label className='block mb-1 text-sm font-medium text-gray-700 ml-1'>
						Xác nhận lại mật khẩu
					</label>
					<input
						type='password'
						id='confirmPassword'
						className='shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 focus:outline-none'
						placeholder='Nhập lại mật khẩu'
						onChange={handleChange}
						required
					/>
				</div>
				{/* Hiển thị lỗi khi mật khẩu không khớp */}
				{formData.newPassword &&
					formData.confirmPassword &&
					formData.newPassword !== formData.confirmPassword && (
						<p className='text-red-500 text-sm -mt-4 mb-4 ml-1'>Mật khẩu không khớp</p>
					)}
				<button
					disabled={!validateValue || loading}
					className={`w-full p-2.5 text-white font-medium rounded-lg text-sm text-center shadow-xs uppercase 
					${
						!validateValue || loading
							? 'bg-gray-400 cursor-not-allowed'
							: 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300'
					}`}>
					{'Đặt lại mật khẩu'}
				</button>
			</form>
		</div>
	);
}
