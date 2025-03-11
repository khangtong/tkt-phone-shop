import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  variations: [],
  loading: false,
  error: null,
};

const variationSlice = createSlice({
  name: "variation",
  initialState,
  reducers: {
    addVariationStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addVariationSuccess: (state, action) => {
      state.loading = false;
      state.variations.push(action.payload);
    },
    addVariationFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    getVariationsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getVariationsSuccess: (state, action) => {
      state.loading = false;
      state.variations = action.payload;
    },
    getVariationsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateVariationStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateVariationSuccess: (state, action) => {
      state.loading = false;
      state.variations = state.variations.map((variation) =>
        variation._id === action.payload._id ? action.payload : variation
      );
    },
    updateVariationFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteVariationStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteVariationSuccess: (state, action) => {
      state.loading = false;
      state.variations = state.variations.filter(
        (variation) => variation._id !== action.payload
      );
    },
    deleteVariationFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  addVariationStart,
  addVariationSuccess,
  addVariationFailure,
  getVariationsStart,
  getVariationsSuccess,
  getVariationsFailure,
  updateVariationStart,
  updateVariationSuccess,
  updateVariationFailure,
  deleteVariationStart,
  deleteVariationSuccess,
  deleteVariationFailure,
} = variationSlice.actions;

export default variationSlice.reducer;
