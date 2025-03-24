import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  cartQuantity: 0,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload.items;
      state.cartQuantity = action.payload.totalQuantity;
    },
    // additional reducers for add, update, remove items can go here
  },
});

export const { setCart } = cartSlice.actions;
export default cartSlice.reducer;
