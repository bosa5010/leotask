import mongoose from "mongoose";

const ItemStatusSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: false },
    description: { type: String, required: true },

    // deleted flag for soft delete feature
    deleted: {
      type: mongoose.Schema.Types.Boolean,
      index: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
const ItemStatus = mongoose.model("ItemStatus", ItemStatusSchema);

export default ItemStatus;
