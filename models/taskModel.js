import mongoose from "mongoose";
// import autoIncrement from "mongoose-auto-increment";
// import { connection } from "../dataBase.js";

// autoIncrement.initialize(connection);

const taskSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      default: "task000001",
    },
    referenceNumber: { type: Number, required: true, unique: true, default: 1 },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    taskModel: { type: mongoose.Schema.Types.ObjectID, ref: "TaskModel" },
    system: { type: mongoose.Schema.Types.ObjectID, ref: "System" },
    instance: { type: mongoose.Schema.Types.ObjectID, ref: "Instance" },
    currentStep: { type: mongoose.Schema.Types.ObjectID, ref: "Step" },
    startWeek: { type: mongoose.Schema.Types.ObjectID, ref: "Week" },
    startDate: { type: Date, required: true },
    endWeek: { type: mongoose.Schema.Types.ObjectID, ref: "Week" },
    endDate: { type: Date, required: true },
    closedDate: { type: Date, required: true },
    dedline: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectID, ref: "User" },
    responsibleUser: { type: mongoose.Schema.Types.ObjectID, ref: "User" },
    responsibleUsers: [{ type: mongoose.Schema.Types.ObjectID, ref: "User" }],
    responsibleGroup: { type: mongoose.Schema.Types.ObjectID, ref: "Group" },
    responsibleGroups: [{ type: mongoose.Schema.Types.ObjectID, ref: "Group" }],
    responsibleTeam: { type: mongoose.Schema.Types.ObjectID, ref: "Team" },
    responsibleTeams: [{ type: mongoose.Schema.Types.ObjectID, ref: "Team" }],
    status: { type: mongoose.Schema.Types.ObjectID, ref: "Status" },
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

// taskSchema.plugin(autoIncrement.plugin, {
//   model: "Task",
//   field: "reference",
//   prefix: "Task",
// });

const Task = mongoose.model("Task", taskSchema);

export default Task;
