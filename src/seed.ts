import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { Vet } from "./models/Vet";
import { VETS } from "./data/vets";
import { Pet } from "./models/Pet";
import { PETS } from "./data/pets";

async function seed() {
  await connectDB();

  for (const vet of VETS) {
    await Vet.updateOne({ id: vet.id }, vet, { upsert: true });
  }
  console.log(`${VETS.length} vets in ${mongoose.connection.name}`);

  for (const pet of PETS) {
    await Pet.updateOne({ id: pet.id }, pet, { upsert: true });
  }
  console.log(`${PETS.length} pets in ${mongoose.connection.name}`);

  await mongoose.disconnect();
}

seed().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
