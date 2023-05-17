import mongoose from "mongoose";

const CalenderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    // deleted flag for soft delete feature
    user: { type: mongoose.Schema.Types.ObjectID, ref: "User" },
    week: { type: mongoose.Schema.Types.ObjectID, ref: "Week" },
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
const Calender = mongoose.model("Calender", CalenderSchema);

export default Calender;
