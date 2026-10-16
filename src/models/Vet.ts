import { Schema, model } from "mongoose";
import type { VetDoc } from "../types/index";

const vetSchema = new Schema<VetDoc>({
  id: {
    type: Number,
    required: [true, "id is required"],
    unique: true,
  },
  name: {
    type: String,
    required: [true, "name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    default: "vet",
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  specialization: {
    type: String,
    trim: true,
  },
});

vetSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret.id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Vet = model<VetDoc>("Vet", vetSchema);
