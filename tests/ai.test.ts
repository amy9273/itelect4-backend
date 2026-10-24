import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../src/app";

// Replace the real connectDB with a no-op fake for this test file so
// tests never wait on or require a live MongoDB connection or MONGODB_URI.
vi.mock("../src/config/db", () => ({
  connectDB: async () => {},
}));

// Generates a valid signed JWT matching the shape created by POST /api/auth/login
function tokenFor(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "5m",
  });
}

describe("POST /api/ai", () => {
  it("answers 401 when there is no token", async () => {
    const res = await request(app)
      .post("/api/ai")
      .send({ prompt: "A pet clinic appointment scheduler in React." });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe(
      "No token. Send Authorization: Bearer <token>",
    );
  });

  it("answers 401 when the token was signed with another secret", async () => {
    const forged = jwt.sign({ userId: "someone" }, "not-the-secret");

    const res = await request(app)
      .post("/api/ai")
      .set("Authorization", `Bearer ${forged}`)
      .send({ prompt: "A pet clinic appointment scheduler in React." });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Token is invalid or has expired");
  });

  it("lets a valid token through, then checks the body", async () => {
    // "Too short" is 9 characters, so aiRequestSchema refuses it with 400
    // before reviewProject() runs -- Gemini is never called, saving quota.
    const res = await request(app)
      .post("/api/ai")
      .set("Authorization", `Bearer ${tokenFor("test-user")}`)
      .send({ prompt: "Too short" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([
      "Describe your project or pet consultation in at least 20 characters.",
    ]);
  });
});
