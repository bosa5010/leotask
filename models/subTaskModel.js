import mongoose from "mongoose";

const subTaskSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectID, ref: "Task" },
    taskModel: { type: mongoose.Schema.Types.ObjectID, ref: "TaskModel" },
    system: { type: mongoose.Schema.Types.ObjectID, ref: "System" },
    instance: { type: mongoose.Schema.Types.ObjectID, ref: "Instance" },
    createdBy: { type: mongoose.Schema.Types.ObjectID, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectID, ref: "User" },
    taskStep: { type: mongoose.Schema.Types.ObjectID, ref: "Step" },
    item: { type: mongoose.Schema.Types.ObjectID, ref: "Item" },
    itemStatus: { type: mongoose.Schema.Types.ObjectID, ref: "ItemStatus" },
    itemComment: { type: String, required: true },
    itemNumber: { type: Number, required: true },
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

const SubTask = mongoose.model("SubTask", subTaskSchema);

export default SubTask;
