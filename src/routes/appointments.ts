import { Router, type Request, type Response } from "express";
import { Appointment } from "../models/Appointment";
import { requireAuth } from "../middleware/auth";
import type { NewAppointmentBody } from "../types/index";

export const appointmentRouter = Router();

// Protect all routes with requireAuth
appointmentRouter.use(requireAuth);

interface IdParam {
  id: string;
}

// GET /api/appointments -- only the ones belonging to this token's user
appointmentRouter.get("/", async (req: Request, res: Response) => {
  const appointments = await Appointment.find({
    userId: req.userId,
  }).sort({ scheduledAt: -1 });
  res.json(appointments);
});

// GET /api/appointments/:id -- single appointment owned by user
appointmentRouter.get(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!appointment) {
      res.status(404).json({ message: "No appointment with that id" });
      return;
    }

    res.json(appointment);
  },
);

// POST /api/appointments -- create a new appointment
appointmentRouter.post(
  "/",
  async (
    req: Request<unknown, unknown, NewAppointmentBody>,
    res: Response,
  ) => {
    const appointment = await Appointment.create({
      ...req.body,
      userId: req.userId,
    });

    res.status(201).json(appointment);
  },
);

// PATCH /api/appointments/:id -- update an appointment
appointmentRouter.patch(
  "/:id",
  async (
    req: Request<IdParam, unknown, Partial<NewAppointmentBody>>,
    res: Response,
  ) => {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, returnDocument: "after", runValidators: true },
    );

    if (!appointment) {
      res.status(404).json({ message: "No appointment with that id" });
      return;
    }

    res.json(appointment);
  },
);

// DELETE /api/appointments/:id -- delete an appointment
appointmentRouter.delete(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!appointment) {
      res.status(404).json({ message: "No appointment with that id" });
      return;
    }

    res.status(204).send();
  },
);
