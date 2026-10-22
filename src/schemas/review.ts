import { z } from "zod";

// What a client is allowed to send to POST /api/ai. Checked before
// anything is sent to Gemini, because every request that reaches
// Gemini is counted against your free quota -- a request that was
// never going to work should cost nothing.
export const aiRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(20, "Describe your project or pet consultation in at least 20 characters.")
    .max(2000, "Keep the description under 2000 characters."),
});

// What Gemini has to send BACK. This one schema is used three ways:
//   1. z.infer below turns it into the Review type for TypeScript.
//   2. z.toJSONSchema at the bottom turns it into the JSON Schema
//      that is sent to Gemini with every request.
//   3. reviewSchema.safeParse in src/ai/gemini.ts checks the reply.
// .describe() is not a comment: the text travels to Gemini inside
// the JSON Schema and tells the model what each field is for.
export const reviewSchema = z.object({
  summary: z
    .string()
    .describe("One sentence restating the pet consultation, symptoms, or project details."),
  strengths: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe("One to three positive observations, stable conditions, or well-described aspects."),
  improvements: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe("One to three concrete recommendations, preparatory actions, or points to clarify."),
  readiness: z
    .enum(["ready", "almost", "not-yet"])
    .describe("Readiness level: 'ready' if ready for consultation or submission, 'almost' if 1-2 minor details are missing, 'not-yet' if too vague to evaluate."),
});

export type Review = z.infer<typeof reviewSchema>;

// Computed once, when this file is first imported -- not per request.
export const reviewJsonSchema = z.toJSONSchema(reviewSchema);
