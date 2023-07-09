import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    // deleted flag for soft delete feature
    team: { type: mongoose.Schema.Types.ObjectID, ref: "Team" },
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
const Group = mongoose.model("Group", GroupSchema);

export default Group;
