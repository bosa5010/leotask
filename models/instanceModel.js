import mongoose from "mongoose";

const InstanceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: false },
    description: { type: String, required: true },
    system: { type: mongoose.Schema.Types.ObjectID, ref: "System" },

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
const Instance = mongoose.model("Instance", InstanceSchema);

export default Instance;
