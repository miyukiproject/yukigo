// src/types.ts
import { z } from "zod";
import { InspectionRule } from "yukigo";

export const InspectionRuleSchema: z.ZodType<InspectionRule> = z.object({
  inspection: z.string(),
  args: z.array(z.string()).default([]),
  expected: z.boolean(),
  binding: z.string().optional(),
});

export const ExerciseFixtureSchema = z.object({
  id: z.number(),
  guideId: z.number(),
  lesson: z.string(),
  language: z.enum(["haskell", "prolog", "wollok"]),
  solution: z.string().nullable(),
  extra: z.string().nullable(),
  test: z.string().nullable(),
  expectations: z.array(InspectionRuleSchema),
});

export type ExerciseFixture = z.infer<typeof ExerciseFixtureSchema>;
