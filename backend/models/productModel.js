import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  image: {
    type: Array,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
  },
  colors: [{ type: mongoose.Schema.Types.ObjectId, ref: "color" }],
  discount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "discount",
    default: null,
  },
});
const productModel = mongoose.model("product", productSchema);
export default productModel;
