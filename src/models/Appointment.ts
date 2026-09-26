import { Schema, model } from "mongoose";
import type { AppointmentDoc } from "../types/index";

const appointmentSchema = new Schema<AppointmentDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    petId: {
      type: Number,
    },
    vetId: {
      type: Number,
    },
    type: {
      type: String,
      required: [true, "Appointment type is required"],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
    fee: {
      type: Number,
      min: [0, "Fee cannot be negative"],
      max: [10000, "Fee cannot exceed 10000"],
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

appointmentSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Appointment = model<AppointmentDoc>(
  "Appointment",
  appointmentSchema,
);
