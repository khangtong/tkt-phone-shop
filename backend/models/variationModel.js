import mongoose from "mongoose";

const variationSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  ram: {
    type: Number,
    required: true,
  },
  rom: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  discount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "discount",
    default: null,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    // required: true,
  },
});

const variationModel = mongoose.model("variation", variationSchema);
export default variationModel;
