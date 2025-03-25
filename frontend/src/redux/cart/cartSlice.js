import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalPrice: 0,
  totalQuantity: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      if (action.payload?.cartDetails) {
        state.items = action.payload.cartDetails.map((cartDetail) => ({
          ...cartDetail.variation,
          quantity: cartDetail.quantity,
          cartDetailId: cartDetail._id,
          cartId: cartDetail.cart,
        }));
        state.totalPrice = action.payload.totalPrice;
        state.totalQuantity = action.payload.totalQuantity;
      } else {
        return initialState;
      }
    },
    clearCart: () => initialState,
  },
});

export const { setCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
