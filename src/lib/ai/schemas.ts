import { z } from "zod";

export const ExtractedSymptomSchema = z.object({
  name: z.string().min(1),
  onset: z.string().optional(),
  frequency: z.string().optional(),
  severity: z.enum(["mild", "moderate", "severe", "unknown"]).default("unknown"),
});

export type ExtractedSymptom = z.infer<typeof ExtractedSymptomSchema>;

// Tool parameters for the single streaming extraction call.
export const RecordSymptomsSchema = z.object({
  extractedSymptoms: z.array(ExtractedSymptomSchema),
  isComplete: z.boolean(),
  confidenceScore: z.number().min(0).max(1), // logged only — never a gate
  // 2–4 short tappable answers that directly fit THIS turn's question, or an
  // empty array when the owner should type freely (e.g. describing a symptom).
  suggestedReplies: z.array(z.string()).max(4).default([]),
});

export const RiskClassificationSchema = z.object({
  riskLevel: z.enum(["Low", "Medium", "High"]),
  confidenceScore: z.number().min(0).max(1),
  primaryConcern: z.string(),
  clinicalReasoning: z.string(),
  recommendedAction: z.string(),
  redFlags: z.array(z.string()).default([]),
  aboutSymptoms: z.string(),
});

export type RiskClassification = z.infer<typeof RiskClassificationSchema>;
