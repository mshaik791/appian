import { z } from 'zod';

export const gradingResultSchema = z.object({
  scores: z.object({
    empathyEngagement: z.number().min(1).max(5),
    culturalResponsiveness: z.number().min(1).max(5),
    ethicsProfessionalism: z.number().min(1).max(5),
    assessmentPlanning: z.number().min(1).max(5),
    overall: z.number().min(1).max(5),
  }),
  competencyScores: z.record(z.string(), z.number().min(1).max(5)),
  evidenceQuotes: z.array(z.string()).min(3).max(8),
  summary: z.string().min(100).max(200),
  suggestions: z.array(z.string()).min(3).max(6),
});

export type GradingResult = z.infer<typeof gradingResultSchema>;

export const gradingWeightsSchema = z.object({
  empathyEngagement: z.number().min(0).max(1).default(0.30),
  culturalResponsiveness: z.number().min(0).max(1).default(0.25),
  ethicsProfessionalism: z.number().min(0).max(1).default(0.15),
  assessmentPlanning: z.number().min(0).max(1).default(0.30),
});

export type GradingWeights = z.infer<typeof gradingWeightsSchema>;

export const evaluationRequestSchema = z.object({
  caseId: z.string(),
  simSessionId: z.string(),
  transcript: z.string(),
  competencyCodes: z.array(z.string()),
  track: z.enum(['BSW', 'MSW']),
  level: z.enum(['BSW', 'MSW']),
  questionBreakdown: z.array(z.object({
    order: z.number(),
    prompt: z.string(),
    answer: z.string(),
  })),
  weights: gradingWeightsSchema.optional(),
});

export type EvaluationRequest = z.infer<typeof evaluationRequestSchema>;
