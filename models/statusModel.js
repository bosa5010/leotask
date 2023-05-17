import mongoose from "mongoose";

const StatusSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    number: { type: Number, required: true, inque: true },
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
const Status = mongoose.model("Status", StatusSchema);

export default Status;
