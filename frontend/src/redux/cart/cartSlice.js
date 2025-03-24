import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // Danh sách sản phẩm trong giỏ hàng
  totalPrice: 0, // Tổng giá trị đơn hàng
  totalQuantity: 0, // Tổng số lượng sản phẩm
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action) => {
      // Chuyển đổi từ API response sang cấu trúc internal
      if (action.payload?.variation) {
        return {
          items: action.payload.variation.map((item) => ({
            ...item,
            quantity: item.quantity || 1,
          })),
          totalPrice: action.payload.totalPrice || 0,
          totalQuantity:
            action.payload.totalQuantity ||
            action.payload.variation.reduce(
              (sum, item) => sum + (item.quantity || 1),
              0
            ),
        };
      }
      return action.payload;
    },

    clearCart: () => initialState,

    updateItemQuantity: (state, action) => {
      const { itemId, newQuantity } = action.payload;

      const updatedItems = state.items
        .map((item) =>
          item._id === itemId
            ? { ...item, quantity: Math.max(1, newQuantity) }
            : item
        )
        .filter((item) => item.quantity > 0);

      // Tính toán lại tổng giá và số lượng
      const totalQuantity = updatedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const totalPrice = updatedItems.reduce((sum, item) => {
        const price =
          item.discount && new Date(item.discount.endDate) > new Date()
            ? item.price * (1 - item.discount.amount / 100)
            : item.price;
        return sum + price * item.quantity;
      }, 0);

      return {
        ...state,
        items: updatedItems,
        totalPrice,
        totalQuantity,
      };
    },

    // Thêm reducer mới để xóa sản phẩm
    removeItem: (state, action) => {
      const itemId = action.payload;
      const updatedItems = state.items.filter((item) => item._id !== itemId);

      const totalQuantity = updatedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const totalPrice = updatedItems.reduce((sum, item) => {
        const price =
          item.discount && new Date(item.discount.endDate) > new Date()
            ? item.price * (1 - item.discount.amount / 100)
            : item.price;
        return sum + price * item.quantity;
      }, 0);

      return {
        ...state,
        items: updatedItems,
        totalPrice,
        totalQuantity,
      };
    },
  },
});

export const { setCart, clearCart, updateItemQuantity, removeItem } =
  cartSlice.actions;

export default cartSlice.reducer;
