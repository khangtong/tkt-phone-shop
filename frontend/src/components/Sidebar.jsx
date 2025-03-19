import { useState } from 'react';
import {
	FaList,
	FaBoxOpen,
	FaPlus,
	FaChevronDown,
	FaThList,
	FaShapes,
	FaTags, // Icon cho mã giảm giá
	FaChartLine, // Icon cho thống kê doanh thu
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
export default function Sidebar({ activeTab, setActiveTab }) {
	const [isDropdownOpen, setIsDropdownOpen] = useState(null);
	const [selectedSubTab, setSelectedSubTab] = useState('all-products');

	const toggleDropdown = (tab) => {
		setActiveTab(tab);
		setIsDropdownOpen((prev) => (prev === tab ? null : tab));
	};

	return (
		<div className='w-1/4 bg-white shadow-lg p-5 rounded-xl m-4 h-screen max-h-[calc(100vh-32px)] overflow-y-auto'>
			<h2 className='text-2xl font-bold mb-6 text-center'>Dashboard</h2>
			<nav className='space-y-4'>
				<hr className='border-gray-300 my-4' />

				{/* Quản lý sản phẩm */}
				<button
					onClick={() => toggleDropdown('products')}
					className={`flex items-center justify-between p-4 w-full text-left rounded-xl transition ${
						activeTab === 'products' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
					}`}>
					<div className='flex items-center'>
						<FaBoxOpen className='mr-2' /> Quản lý sản phẩm
					</div>
					<FaChevronDown
						className={`transition-transform ${
							isDropdownOpen === 'products' ? 'rotate-180' : 'rotate-0'
						}`}
					/>
				</button>
				{isDropdownOpen === 'products' && (
					<div className='ml-6 space-y-3.5 transition-opacity duration-300 ease-in-out'>
						<Link to='/admin/dashboard/product' className='block'>
							<button
								className={`flex items-center px-4 py-2 w-full rounded-lg hover:bg-green-600 ${
									selectedSubTab === 'all-products'
										? 'bg-green-600 text-white'
										: 'bg-green-500 text-white'
								}`}
								onClick={() => setSelectedSubTab('all-products')}>
								<FaThList className='mr-2' /> Tất cả sản phẩm
							</button>
						</Link>

						<Link to='/admin/dashboard/product/add' className='block'>
							<button
								className={`flex items-center px-4 py-2 w-full rounded-lg hover:bg-green-600 ${
									selectedSubTab === 'add-product'
										? 'bg-green-600 text-white'
										: 'bg-green-500 text-white'
								}`}
								onClick={() => setSelectedSubTab('add-product')}>
								<FaPlus className='mr-2' /> Thêm sản phẩm
							</button>
						</Link>
					</div>
				)}
				<hr className='border-gray-300 my-4' />

				{/* Quản lý biến thể */}
				<button
					onClick={() => toggleDropdown('variations')}
					className={`flex items-center justify-between p-4 w-full text-left rounded-xl transition ${
						activeTab === 'variations' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
					}`}>
					<div className='flex items-center'>
						<FaShapes className='mr-2' /> Quản lý biến thể
					</div>
					<FaChevronDown
						className={`transition-transform ${
							isDropdownOpen === 'variations' ? 'rotate-180' : 'rotate-0'
						}`}
					/>
				</button>
				{isDropdownOpen === 'variations' && (
					<div className='ml-6 space-y-3.5 transition-opacity duration-300 ease-in-out'>
						<Link to='/admin/dashboard/variation/' className='block'>
							<button className='flex items-center bg-indigo-500 text-white px-4 py-2 w-full rounded-lg hover:bg-indigo-600'>
								<FaThList className='mr-2' /> Tất cả biến thể
							</button>
						</Link>

						<Link to='/admin/dashboard/variation/add' className='block'>
							<button className='flex items-center bg-teal-500 text-white px-4 py-2 w-full rounded-lg hover:bg-teal-600'>
								<FaPlus className='mr-2' /> Thêm biến thể
							</button>
						</Link>
					</div>
				)}
				<hr className='border-gray-300 my-4' />

				{/* Quản lý danh mục */}
				<button
					onClick={() => toggleDropdown('categories')}
					className={`flex items-center justify-between p-4 w-full text-left rounded-xl transition ${
						activeTab === 'categories' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
					}`}>
					<div className='flex items-center'>
						<FaList className='mr-2' /> Quản lý danh mục
					</div>
					<FaChevronDown
						className={`transition-transform ${
							isDropdownOpen === 'categories' ? 'rotate-180' : 'rotate-0'
						}`}
					/>
				</button>
				{isDropdownOpen === 'categories' && (
					<div className='ml-6 space-y-3.5 transition-opacity duration-300 ease-in-out'>
						<Link to='/admin/dashboard/category' className='block'>
							<button className='flex items-center bg-purple-500 text-white px-4 py-2 w-full rounded-lg hover:bg-purple-600'>
								<FaThList className='mr-2' /> Tất cả danh mục
							</button>
						</Link>

						<Link to='/admin/dashboard/category/add' className='block'>
							<button className='flex items-center bg-orange-500 text-white px-4 py-2 w-full rounded-lg hover:bg-orange-600'>
								<FaPlus className='mr-2' /> Thêm danh mục
							</button>
						</Link>
					</div>
				)}
				<hr className='border-gray-300 my-4' />

				{/* Quản lý mã giảm giá */}
				<button
					onClick={() => toggleDropdown('discounts')}
					className={`flex items-center justify-between p-4 w-full text-left rounded-xl transition ${
						activeTab === 'discounts' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
					}`}>
					<div className='flex items-center'>
						<FaTags className='mr-2' /> Quản lý mã giảm giá
					</div>
					<FaChevronDown
						className={`transition-transform ${
							isDropdownOpen === 'discounts' ? 'rotate-180' : 'rotate-0'
						}`}
					/>
				</button>
				{isDropdownOpen === 'discounts' && (
					<div className='ml-6 space-y-3.5 transition-opacity duration-300 ease-in-out'>
						<Link to='/admin/dashboard/discount' className='block'>
							<button className='flex items-center bg-pink-500 text-white px-4 py-2 w-full rounded-lg hover:bg-pink-600'>
								<FaThList className='mr-2' /> Tất cả mã giảm giá
							</button>
						</Link>

						<Link to='/admin/dashboard/discount/add' className='block'>
							<button className='flex items-center bg-yellow-500 text-white px-4 py-2 w-full rounded-lg hover:bg-yellow-600'>
								<FaPlus className='mr-2' /> Thêm mã giảm giá
							</button>
						</Link>

						<Link to='/admin/dashboard/discount/variation' className='block'>
							<button className='flex items-center bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 w-full rounded-lg'>
								<FaPlus className='mr-2' />
								Thêm mã cho biến thể
							</button>
						</Link>
					</div>
				)}
				<hr className='border-gray-300 my-4' />

				{/* Thống kê doanh thu */}
				<Link to='/admin/dashboard/revenue' className='block'>
					<button
						className={`flex items-center justify-between p-4 w-full text-left rounded-xl transition ${
							activeTab === 'revenue' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
						}`}
						onClick={() => setActiveTab('revenue')}>
						<div className='flex items-center'>
							<FaChartLine className='mr-2' /> Thống kê doanh thu
						</div>
					</button>
				</Link>
				<hr className='border-gray-300 my-4' />
			</nav>
		</div>
	);
}
