import { Router, type Request, type Response } from "express";
import { Pet } from "../models/Pet";
import type { PetDoc } from "../types/index";

export const petRouter = Router();

// GET /api/pets -- list all pets
petRouter.get("/", async (_req: Request, res: Response) => {
  const pets = await Pet.find().sort({ id: 1 });
  res.json(pets);
});

interface IdParam {
  id: string;
}

// GET /api/pets/:id -- single pet by ID
petRouter.get("/:id", async (req: Request<IdParam>, res: Response) => {
  const numId = Number(req.params.id);
  const pet = !isNaN(numId) ? await Pet.findOne({ id: numId }) : null;

  if (!pet) {
    res.status(404).json({
      message: `No pet with id "${req.params.id}"`,
    });
    return;
  }

  res.json(pet);
});

// POST /api/pets -- register new pet
petRouter.post(
  "/",
  async (
    req: Request<unknown, unknown, Omit<PetDoc, "id"> & { id?: number | string }>,
    res: Response,
  ) => {
    let petId =
      typeof req.body.id === "number" ? req.body.id : Number(req.body.id);
    if (!petId || isNaN(petId)) {
      const highestPet = await Pet.findOne().sort({ id: -1 });
      petId = highestPet ? highestPet.id + 1 : 101;
    }

    const pet = await Pet.create({
      ...req.body,
      id: petId,
    });

    res.status(201).json(pet);
  },
);
