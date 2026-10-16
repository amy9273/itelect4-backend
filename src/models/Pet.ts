import { Schema, model } from "mongoose";
import type { PetDoc } from "../types/index";

const petSchema = new Schema<PetDoc>({
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
  species: {
    type: String,
    required: [true, "species is required"],
    trim: true,
  },
  breed: {
    type: String,
    required: [true, "breed is required"],
    trim: true,
  },
  ownerId: {
    type: Number,
    required: [true, "ownerId is required"],
  },
});

petSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret.id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Pet = model<PetDoc>("Pet", petSchema);
