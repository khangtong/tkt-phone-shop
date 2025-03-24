import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	currentUser: null,
	error: null,
	loading: false,
};

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		loginStart: (state) => {
			state.loading = true;
		},
		loginSuccess: (state, action) => {
			state.currentUser = action.payload;
			if (action.payload?.token) {
				localStorage.setItem('token', action.payload.token);
			}
			state.loading = false;
			state.error = null;
		},
		loginFailure: (state, action) => {
			state.error = action.payload;
			state.loading = false;
		},
		logout: (state) => {
			state.currentUser = null;
			localStorage.removeItem('token');
		},
		updateUserStart: (state) => {
			state.loading = true;
		},
		updateUserSuccess: (state, action) => {
			state.currentUser = action.payload;
			state.loading = false;
			state.error = null;
		},
		updateUserFailure: (state, action) => {
			state.error = action.payload;
			state.loading = false;
		},
	},
});

export const {
	loginStart,
	loginSuccess,
	loginFailure,
	logout,
	updateUserFailure,
	updateUserStart,
	updateUserSuccess,
} = userSlice.actions;
export default userSlice.reducer;
