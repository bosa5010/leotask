import mongoose from "mongoose";

const TaskThemeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    // deleted flag for soft delete feature
    teams: [{ type: mongoose.Schema.Types.ObjectID, ref: "Team" }],
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
const TaskTheme = mongoose.model("TaskTheme", TaskThemeSchema);

export default TaskTheme;
