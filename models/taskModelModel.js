import mongoose from "mongoose";

const TaskModelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    // deleted flag for soft delete feature
    taskTheme: { type: mongoose.Schema.Types.ObjectID, ref: "TaskTheme" },
    steps: [{ type: mongoose.Schema.Types.ObjectID, ref: "Step" }],
    systems: [{ type: mongoose.Schema.Types.ObjectID, ref: "System" }],
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
const TaskModel = mongoose.model("TaskModel", TaskModelSchema);

export default TaskModel;
