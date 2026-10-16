import { Router, type Request, type Response } from "express";
import { Vet } from "../models/Vet";

export const vetRouter = Router();

// Public routes: no requireAuth middleware is mounted above these
// GET /api/vets -- list all veterinarians
vetRouter.get("/", async (_req: Request, res: Response) => {
  const vets = await Vet.find().sort({ id: 1 });
  res.json(vets);
});

interface IdParam {
  id: string;
}

// GET /api/vets/:id -- single veterinarian by ID
vetRouter.get("/:id", async (req: Request<IdParam>, res: Response) => {
  const numId = Number(req.params.id);
  const vet = !isNaN(numId) ? await Vet.findOne({ id: numId }) : null;

  if (!vet) {
    res.status(404).json({
      message: `No veterinarian with id "${req.params.id}"`,
    });
    return;
  }

  res.json(vet);
});
