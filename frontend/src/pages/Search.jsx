import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

const formatPrice = (price) =>
	new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
		.format(price)
		.replace('₫', 'đ');

const calculateDiscountedPrice = (price, discountAmount) => {
	if (!discountAmount || discountAmount <= 0) return price;
	return price - (price * discountAmount) / 100;
};

const formatRom = (rom) => {
	if (rom >= 1024) {
		// Handle TB
		return `${(rom / 1024).toFixed(0)} TB`;
	}
	return `${rom} GB`;
};

const isDiscountActive = (discount) => {
	if (!discount || !discount.startDate || !discount.endDate) return false;
	const currentDate = new Date();
	const startDate = new Date(discount.startDate);
	const endDate = new Date(discount.endDate);
	return currentDate >= startDate && currentDate <= endDate;
};

const PRICE_RANGES = [
	{ id: 'all', label: 'Tất cả', min: 0, max: Infinity },
	{ id: 'under_2m', label: 'Dưới 2 triệu', min: 0, max: 1999999 },
	{ id: '2m_4m', label: 'Từ 2 - 4 triệu', min: 2000000, max: 3999999 },
	{ id: '4m_7m', label: 'Từ 4 - 7 triệu', min: 4000000, max: 6999999 },
	{ id: '7m_13m', label: 'Từ 7 - 13 triệu', min: 7000000, max: 12999999 },
	{ id: '13m_20m', label: 'Từ 13 - 20 triệu', min: 13000000, max: 19999999 },
	{ id: 'over_20m', label: 'Trên 20 triệu', min: 20000000, max: Infinity },
];

const RAM_OPTIONS = [4, 8, 12, 16];
const ROM_OPTIONS = [
	{ id: 'lte_128', label: '≤128 GB', value: 128, type: 'lte' },
	{ id: '256', label: '256 GB', value: 256, type: 'eq' },
	{ id: '512', label: '512 GB', value: 512, type: 'eq' },
	{ id: '1024', label: '1 TB', value: 1024, type: 'eq' },
];

const Search = () => {
	const [products, setProducts] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [searchKeyword, setSearchKeyword] = useState('');
	const [searchParams, setSearchParams] = useSearchParams();

	// Filter States
	const [selectedPriceRangeId, setSelectedPriceRangeId] = useState('all');
	const [customMinPrice, setCustomMinPrice] = useState('');
	const [customMaxPrice, setCustomMaxPrice] = useState('');
	const [selectedRams, setSelectedRams] = useState([]);
	const [selectedRoms, setSelectedRoms] = useState([]);

	// Sorting State
	const [sortBy, setSortBy] = useState('popular'); // 'popular', 'price-asc', 'price-desc'

	// Derived State for effective price range
	const priceRange = useMemo(() => {
		if (selectedPriceRangeId !== 'custom') {
			return PRICE_RANGES.find((r) => r.id === selectedPriceRangeId) || PRICE_RANGES[0];
		}
		const min = parseFloat(customMinPrice) || 0;
		const max = parseFloat(customMaxPrice) || Infinity;
		return { id: 'custom', label: 'Tùy chỉnh', min, max };
	}, [selectedPriceRangeId, customMinPrice, customMaxPrice]);

	const handlePriceRangeChange = (event) => {
		setSelectedPriceRangeId(event.target.value);

		// Reset custom inputs if a predefined range is chosen
		if (event.target.value !== 'custom') {
			setCustomMinPrice('');
			setCustomMaxPrice('');
		} else {
			setSelectedPriceRangeId('custom'); // Ensure custom is selected
		}
	};
	const handleCustomPriceChange = (event, type) => {
		const value = event.target.value.replace(/\D/g, ''); // Remove non-digits
		if (type === 'min') {
			setCustomMinPrice(value);
		} else {
			setCustomMaxPrice(value);
		}
		setSelectedPriceRangeId('custom'); // Activate custom range when typing
	};

	const handleRamChange = (ramValue) => {
		setSelectedRams(
			(prev) =>
				prev.includes(ramValue)
					? prev.filter((r) => r !== ramValue) // Unselect if already selected
					: [...prev, ramValue], // Select if not selected
		);
	};

	const handleRomChange = (romOptionId) => {
		setSelectedRoms(
			(prev) =>
				prev.includes(romOptionId)
					? prev.filter((id) => id !== romOptionId) // Unselect
					: [...prev, romOptionId], // Select
		);
	};

	const handleSortChange = (event) => {
		setSortBy(event.target.value);
	};

	const checkPriceMatch = (variation, currentPriceRange) => {
		const effectivePrice = calculateDiscountedPrice(
			variation.price,
			isDiscountActive(variation.discount) ? variation.discount.amount : 0,
		);
		return effectivePrice >= currentPriceRange.min && effectivePrice <= currentPriceRange.max;
	};

	const checkRamMatch = (variation, currentSelectedRams) => {
		return currentSelectedRams.length === 0 || currentSelectedRams.includes(variation.ram);
	};

	const checkRomMatch = (variation, currentSelectedRoms) => {
		return (
			currentSelectedRoms.length === 0 ||
			currentSelectedRoms.some((romId) => {
				const romOption = ROM_OPTIONS.find((opt) => opt.id === romId);
				if (!romOption) return false;
				if (romOption.type === 'lte') {
					return variation.rom <= romOption.value;
				} else {
					// type === 'eq'
					return variation.rom === romOption.value;
				}
			})
		);
	};

	const [selectedVariants, setSelectedVariants] = useState({});
	const handleVariantChange = (productId, variant) => {
		setSelectedVariants((prev) => ({
			...prev,
			[productId]: variant,
		}));
	};

	// --- Step 1: Filter Products based on filter criteria ---
	const filteredProducts = useMemo(() => {
		let tempProducts = [...products];

		// Filter by Price, RAM, ROM
		tempProducts = tempProducts.filter((product) => {
			// Check if *any* variation matches the filters
			return product.variation.some((variation) => {
				return (
					checkPriceMatch(variation, priceRange) &&
					checkRamMatch(variation, selectedRams) &&
					checkRomMatch(variation, selectedRoms)
				);
			});
		});

		return tempProducts;
	}, [products, priceRange, selectedRams, selectedRoms]);

	// --- Step 2: Determine the initially displayed variant for filtered products ---
	useEffect(() => {
		const initialSelected = {};
		filteredProducts.forEach((product) => {
			// Find the best matching variant based on current filters
			if (product.variation && product.variation.length > 0) {
				let bestMatchVariant = product.variation.find(
					(v) =>
						checkPriceMatch(v, priceRange) &&
						checkRamMatch(v, selectedRams) &&
						checkRomMatch(v, selectedRoms),
				);
				// Fallbacks
				if (!bestMatchVariant) {
					bestMatchVariant = product.variation.find((v) =>
						checkPriceMatch(v, priceRange),
					);
				}
				if (!bestMatchVariant) {
					const sortedVariations = [...product.variation].sort((va, vb) => {
						const priceVa = calculateDiscountedPrice(
							va.price,
							isDiscountActive(va.discount) ? va.discount.amount : 0,
						);
						const priceVb = calculateDiscountedPrice(
							vb.price,
							isDiscountActive(vb.discount) ? vb.discount.amount : 0,
						);
						return priceVa - priceVb;
					});
					bestMatchVariant = sortedVariations[0];
				}
				initialSelected[product._id] = bestMatchVariant || product.variation[0];
			}
		});

		// Update state only if needed to prevent potential loops if object references change
		if (JSON.stringify(initialSelected) !== JSON.stringify(selectedVariants)) {
			setSelectedVariants(initialSelected);
		}
	}, [filteredProducts, priceRange, selectedRams, selectedRoms]);

	// --- Step 3: Sort the filtered products based on the currently selected variant's price ---
	const sortedProductsToDisplay = useMemo(() => {
		// Create a new array to sort, don't mutate filteredProducts directly
		let tempProductsToSort = [...filteredProducts];

		tempProductsToSort.sort((a, b) => {
			// Get the currently selected variations for products a and b
			const variantA = selectedVariants[a._id];
			const variantB = selectedVariants[b._id];

			// Handle cases where a variant might not be selected yet
			// Assign extreme prices to handle missing variants gracefully during sort
			const priceA = variantA
				? calculateDiscountedPrice(
						variantA.price,
						isDiscountActive(variantA.discount) ? variantA.discount.amount : 0,
				  )
				: sortBy === 'price-asc'
				? Infinity
				: -Infinity; // Handle missing variant A

			const priceB = variantB
				? calculateDiscountedPrice(
						variantB.price,
						isDiscountActive(variantB.discount) ? variantB.discount.amount : 0,
				  )
				: sortBy === 'price-asc'
				? Infinity
				: -Infinity; // Handle missing variant B

			// Perform the sort comparison
			if (sortBy === 'price-asc') {
				return priceA - priceB;
			} else if (sortBy === 'price-desc') {
				return priceB - priceA;
			} else {
				// 'popular' or default
				return 0; // Maintain filtered order or implement relevance sort
			}
		});

		return tempProductsToSort;
	}, [filteredProducts, sortBy, selectedVariants]);

	useEffect(() => {
		const fetchProducts = async () => {
			setIsLoading(true);
			try {
				const response = await fetch(
					`/api/products/search?name=${searchParams.get('name')}`,
				);
				const data = await response.json();
				console.log(data);
				setProducts(data);
				setSearchKeyword(searchParams.get('name') || '');
			} catch (error) {
				console.error('Error fetching products:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProducts();
	}, [searchParams]);

	return (
		<div className='flex flex-col lg:flex-row gap-6 p-4 bg-gray-50 min-h-screen'>
			{/* --- Filter Sidebar --- */}
			<aside className='w-full lg:w-1/4 bg-white p-4 rounded-lg shadow'>
				<h3 className='text-lg font-semibold mb-4 border-b pb-2 flex items-center'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='h-5 w-5 mr-2'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
						strokeWidth={2}>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M3 4h18M3 8h18M3 12h18M3 16h6'
						/>
					</svg>
					Bộ lọc tìm kiếm
				</h3>

				{/* Price Filter */}
				<div className='mb-6'>
					<h4 className='font-semibold mb-3'>Mức giá</h4>
					{PRICE_RANGES.map((range) => (
						<div key={range.id} className='flex items-center mb-2'>
							<input
								type='radio' // Changed to radio for single selection of ranges
								id={`price_${range.id}`}
								name='price_range' // Group radios
								value={range.id}
								checked={selectedPriceRangeId === range.id && range.id !== 'custom'}
								onChange={handlePriceRangeChange}
								className='mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500'
							/>
							<label htmlFor={`price_${range.id}`} className='text-sm text-gray-700'>
								{range.label}
							</label>
						</div>
					))}
					{/* Custom Price Input */}
					<div className='mt-3 pt-3 border-t'>
						<p className='text-sm text-gray-600 mb-2'>
							Hoặc nhập khoảng giá phù hợp với bạn:
						</p>
						<div className='flex items-center gap-2'>
							<input
								type='text'
								placeholder='1.990.000đ'
								value={
									customMinPrice
										? parseInt(customMinPrice).toLocaleString('vi-VN') + 'đ'
										: ''
								}
								onChange={(e) => handleCustomPriceChange(e, 'min')}
								onFocus={() => setSelectedPriceRangeId('custom')} // Select custom when focusing
								className='w-1/2 p-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500'
							/>
							<span>~</span>
							<input
								type='text'
								placeholder='54.990.000đ'
								value={
									customMaxPrice
										? parseInt(customMaxPrice).toLocaleString('vi-VN') + 'đ'
										: ''
								}
								onChange={(e) => handleCustomPriceChange(e, 'max')}
								onFocus={() => setSelectedPriceRangeId('custom')} // Select custom when focusing
								className='w-1/2 p-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500'
							/>
						</div>
					</div>
				</div>

				{/* RAM Filter */}
				<div className='mb-6'>
					<h4 className='font-semibold mb-3'>Dung lượng RAM</h4>
					<div className='flex flex-wrap gap-2'>
						{RAM_OPTIONS.map((ram) => (
							<button
								key={`ram_${ram}`}
								onClick={() => handleRamChange(ram)}
								className={`px-3 py-1 border rounded ${
									selectedRams.includes(ram)
										? 'bg-blue-500 text-white border-blue-500'
										: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
								}`}>
								{ram} GB
							</button>
						))}
					</div>
				</div>

				{/* ROM Filter */}
				<div className='mb-6'>
					<h4 className='font-semibold mb-3'>Dung lượng ROM</h4>
					<div className='grid grid-cols-2 gap-2'>
						{ROM_OPTIONS.map((romOption) => (
							<button
								key={`rom_${romOption.id}`}
								onClick={() => handleRomChange(romOption.id)}
								className={`px-3 py-2 text-sm border rounded text-center ${
									selectedRoms.includes(romOption.id)
										? 'bg-blue-500 text-white border-blue-500'
										: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
								}`}>
								{romOption.label}
							</button>
						))}
					</div>
				</div>
			</aside>

			{/* --- Search Results --- */}
			<main className='w-full lg:w-3/4'>
				{/* Header: Result Count & Sort */}
				<div className='flex justify-between items-center mb-4 bg-white p-3 rounded-md shadow-sm'>
					<p className='text-gray-700'>
						Tìm thấy{' '}
						<span className='font-semibold'>{sortedProductsToDisplay.length}</span> kết
						quả với từ khoá <span className='font-semibold'>"{searchKeyword}"</span>
					</p>
					<div className='flex items-center'>
						<label htmlFor='sort_by' className='text-sm mr-2 text-gray-600'>
							Sắp xếp theo:
						</label>
						<select
							id='sort_by'
							value={sortBy}
							onChange={handleSortChange}
							className='border border-gray-300 rounded p-1.5 text-sm focus:ring-blue-500 focus:border-blue-500'>
							<option value='popular'>Nổi bật</option>
							<option value='price-asc'>Giá thấp đến cao</option>
							<option value='price-desc'>Giá cao đến thấp</option>
						</select>
					</div>
				</div>

				{/* Product Grid */}
				{isLoading ? (
					<p className='text-center text-gray-500 mt-10'>Đang tải sản phẩm...</p>
				) : sortedProductsToDisplay.length === 0 ? (
					<p className='text-center text-gray-500 mt-10 bg-white p-6 rounded-md shadow'>
						Không tìm thấy sản phẩm nào phù hợp.
					</p>
				) : (
					<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
						{sortedProductsToDisplay.map((product) => {
							const selectedVariant = selectedVariants[product._id];

							if (!selectedVariant) return null;

							const hasDiscount = isDiscountActive(selectedVariant.discount);
							const displayPrice = calculateDiscountedPrice(
								selectedVariant.price,
								hasDiscount ? selectedVariant.discount.amount : 0,
							);

							// Find corresponding image - assuming image[0] is the main one
							const productImage =
								product.image && product.image.length > 0
									? product.image[0]
									: 'placeholder.png'; // Add a placeholder image

							// Determine which ROM options to show
							const productRomOptions = [
								...new Set(product.variation.map((v) => v.rom)),
							].sort((a, b) => a - b);

							return (
								<div
									key={product._id}
									className='bg-white rounded-lg shadow overflow-hidden border border-gray-200 flex flex-col justify-between'>
									<div>
										<Link
											to={`/product/${product._id}`} // Link to product detail page
											onClick={() => {
												// Store selected variant info for detail page
												localStorage.setItem(
													'selectedProduct',
													JSON.stringify({
														productId: product._id,
														productName: product.name,
														productImage: productImage,
														selectedVariation: selectedVariant,
													}),
												);
											}}>
											<div className='relative w-full h-48 sm:h-56 overflow-hidden p-4 bg-gray-100'>
												<img
													src={productImage}
													alt={product.name}
													className='w-full h-full object-contain'
												/>
												{hasDiscount && (
													<span className='absolute top-2 right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded'>
														-{selectedVariant.discount.amount}%
													</span>
												)}
											</div>
											<div className='p-3'>
												<h3 className='text-sm font-semibold text-gray-800 line-clamp-2 mb-1 h-10'>
													{product.name} {selectedVariant.ram}GB/
													{formatRom(selectedVariant.rom)} -{' '}
													{selectedVariant.color}
												</h3>
												<div className='mt-1 h-10'>
													{hasDiscount ? (
														<>
															<span className='text-red-600 font-bold text-base mr-1'>
																{formatPrice(displayPrice)}
															</span>
															<span className='text-gray-500 line-through text-xs'>
																{formatPrice(selectedVariant.price)}
															</span>
														</>
													) : (
														<span className='text-red-600 font-bold text-base'>
															{formatPrice(displayPrice)}
														</span>
													)}
												</div>
											</div>
										</Link>
									</div>

									<div className='p-3 pt-1 border-t border-gray-100'>
										{/* Variation Selection */}
										{product.variation.length > 1 ? (
											productRomOptions.length > 1 &&
											product.variation.length <= 4 ? ( // Heuristic to show buttons for simple cases
												<div className='flex gap-2 mb-2 justify-center'>
													{productRomOptions.map((romVal) => {
														// Find a variant that matches the current selection's RAM/Color but has this ROM
														const targetVariant =
															product.variation.find(
																(v) =>
																	v.ram === selectedVariant.ram &&
																	v.color ===
																		selectedVariant.color && // Keep color same for simplicity
																	v.rom === romVal,
															) ||
															product.variation.find(
																(v) => v.rom === romVal,
															); // Fallback if color/ram combo doesn't exist

														if (!targetVariant) return null;

														return (
															<button
																key={`rom_btn_${romVal}`}
																onClick={() =>
																	handleVariantChange(
																		product._id,
																		targetVariant,
																	)
																}
																className={`px-3 py-1 text-xs border rounded ${
																	selectedVariant.rom === romVal
																		? 'bg-blue-100 text-blue-700 border-blue-300'
																		: 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
																}`}>
																{formatRom(romVal)}
															</button>
														);
													})}
												</div>
											) : (
												// Default to dropdown for more complex variations or many options
												<select
													value={selectedVariant._id}
													onChange={(e) => {
														const newVariant = product.variation.find(
															(v) => v._id === e.target.value,
														);
														if (newVariant)
															handleVariantChange(
																product._id,
																newVariant,
															);
													}}
													className='w-full p-1.5 border border-gray-200 rounded text-xs mb-2 focus:ring-blue-500 focus:border-blue-500'>
													{product.variation
														.sort(
															(a, b) =>
																a.ram - b.ram || a.rom - b.rom,
														)
														.map((variant) => (
															<option
																key={variant._id}
																value={variant._id}>
																{variant.ram}GB/
																{formatRom(variant.rom)} -{' '}
																{variant.color}{' '}
																{hasDiscount
																	? `(-${variant.discount.amount}%)`
																	: ''}
															</option>
														))}
												</select>
											)
										) : (
											<div className='h-8 mb-2'></div> // Placeholder height if no selection needed
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</main>
		</div>
	);
};

export default Search;
