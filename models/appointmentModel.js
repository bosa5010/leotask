import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    description: { type: String },
    user: { type: mongoose.Schema.Types.ObjectID, ref: "User" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
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
const Appointment = mongoose.model("Appointment", AppointmentSchema);

export default Appointment;
