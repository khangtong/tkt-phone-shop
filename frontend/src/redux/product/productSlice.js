import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    addProductStart: (state) => {
      state.loading = true;
    },
    addProductSuccess: (state, action) => {
      state.products.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    addProductFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateProductStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateProductSuccess: (state, action) => {
      state.loading = false;
      state.products = state.products.map((product) =>
        product._id === action.payload._id ? action.payload : product
      );
    },
    updateProductFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  addProductStart,
  addProductSuccess,
  addProductFailure,
  updateProductFailure,
  updateProductStart,
  updateProductSuccess,
} = productSlice.actions;
export default productSlice.reducer;
