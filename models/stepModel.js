import mongoose from "mongoose";

const StepSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    number: { type: Number, required: true },
    // deleted flag for soft delete feature
    taskModel: { type: mongoose.Schema.Types.ObjectID, ref: "TaskModel" },
    items: [{ type: mongoose.Schema.Types.ObjectID, ref: "Item" }],
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
const Step = mongoose.model("Step", StepSchema);

export default Step;
