import mongoose from "mongoose";

const orderStatusSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
});
const orderStatusModel = mongoose.model("orderStatus", orderStatusSchema);
export default orderStatusModel;
