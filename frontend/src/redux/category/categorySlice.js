import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  categories: [],
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    addCategoryStart: (state) => {
      state.loading = true;
    },
    addCategorySuccess: (state, action) => {
      state.categories.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    addCategoryFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateCategoryStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateCategorySuccess: (state, action) => {
      state.loading = false;
      state.categories = state.categories.map((product) =>
        product._id === action.payload._id ? action.payload : product
      );
    },
    updateCategoryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  addCategoryStart,
  addCategorySuccess,
  addCategoryFailure,
  updateCategoryFailure,
  updateCategoryStart,
  updateCategorySuccess,
} = categorySlice.actions;
export default categorySlice.reducer;
