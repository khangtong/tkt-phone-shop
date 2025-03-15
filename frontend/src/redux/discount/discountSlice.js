import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	discounts: [],
	loading: false,
	error: null,
};

const discountSlice = createSlice({
	name: 'discount',
	initialState,
	reducers: {
		addDiscountStart: (state) => {
			state.discounts = [];
			state.loading = true;
			state.error = null;
		},
		addDiscountSuccess: (state, action) => {
			state.loading = false;
			state.discounts = action.payload;
		},
		addDiscountFailure: (state, action) => {
			state.loading = false;
			state.error = action.message;
		},
		getDiscountsStart: (state) => {
			state.loading = true;
			state.error = null;
		},
		getDiscountsSuccess: (state, action) => {
			state.loading = false;
			state.discounts = action.payload;
		},
		getDiscountsFailure: (state, action) => {
			state.loading = false;
			state.error = action.message;
		},
		updateDiscountStart: (state) => {
			state.loading = true;
			state.error = null;
		},
		updateDiscountSuccess: (state, action) => {
			state.loading = false;
			state.discounts = state.discounts.map((discount) =>
				discount._id === action.payload._id ? action.payload : Discount,
			);
		},
		updateDiscountFailure: (state, action) => {
			state.loading = false;
			state.error = action.payload;
		},
		deleteDiscountStart: (state) => {
			state.loading = true;
			state.error = null;
		},
		deleteDiscountSuccess: (state, action) => {
			state.loading = false;
			state.discounts = state.discounts.filter((discount) => discount._id !== action.payload);
		},
		deleteDiscountFailure: (state, action) => {
			state.loading = false;
			state.error = action.payload;
		},
	},
});

export const {
	addDiscountStart,
	addDiscountSuccess,
	addDiscountFailure,
	getDiscountsStart,
	getDiscountsSuccess,
	getDiscountsFailure,
	updateDiscountStart,
	updateDiscountSuccess,
	updateDiscountFailure,
	deleteDiscountStart,
	deleteDiscountSuccess,
	deleteDiscountFailure,
} = discountSlice.actions;

export default discountSlice.reducer;
