import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    // deleted flag for soft delete feature
    itemStatus: [{ type: mongoose.Schema.Types.ObjectID, ref: "ItemStatus" }],
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
const Item = mongoose.model("Item", ItemSchema);

export default Item;
