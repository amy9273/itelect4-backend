import type { Types } from "mongoose";

// ===== ENUMS =====
export const AppointmentStatus = {
  Scheduled: "Scheduled",
  Completed: "Completed",
  Cancelled: "Cancelled",
} as const;

export type AppointmentStatus =
  (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

// ===== SESSION 1 INTERFACES =====
// Entity 1: User
export interface User {
  id: number;
  name: string;
  email: string;
  role: "owner" | "vet" | "admin" | "student" | "instructor";
  isActive: boolean;
}

// Entity 2: Pet
export interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  ownerId: number;
}

// Entity 3: Appointment (Primary Resource for Veterinary Clinic App)
export interface Appointment {
  id: number;
  petId: number;
  vetId: number;
  scheduledAt: Date;
  type?: string;
  notes?: string;
  status: AppointmentStatus;
  fee?: number;
}

// Session 1 Submission interface (from class lecture reference)
export interface Submission {
  id: number;
  studentId: number;
  courseCode: string;
  repoUrl: string;
  submittedAt: Date;
  score?: number;
}

// Course interface
export interface Course {
  code: string;
  title: string;
  units: number;
  semester: string;
}

// ===== DERIVED TYPES FOR DATABASE & CLIENT =====
export type UserDoc = Omit<User, "id"> & {
  password: string;
};

// Database doc types use ObjectId for references
export type AppointmentDoc = Omit<Appointment, "id" | "petId" | "vetId"> & {
  userId: Types.ObjectId;
  petId?: number;
  vetId?: number;
};

export type NewAppointmentBody = Pick<
  Appointment,
  "type" | "notes" | "status"
> & {
  petId?: number;
  vetId?: number;
  scheduledAt?: string | Date;
  fee?: number;
};

export type SubmissionDoc = Omit<Submission, "id" | "studentId"> & {
  studentId: Types.ObjectId;
};

export type NewSubmissionBody = Pick<Submission, "courseCode" | "repoUrl"> & {
  score?: number;
  submittedAt?: string | Date;
};

// Entity 4: Vet (Public reference resource for Veterinary Clinic)
export interface Vet {
  id: number;
  name: string;
  email: string;
  role: "vet";
  isActive: boolean;
  specialization?: string;
}

export type VetDoc = Pick<
  Vet,
  "id" | "name" | "email" | "role" | "isActive"
> & {
  specialization?: string;
};

export type PetDoc = Pick<
  Pet,
  "id" | "name" | "species" | "breed" | "ownerId"
>;

