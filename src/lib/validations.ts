import { z } from 'zod';

export const createCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  culturalContextJson: z.record(z.any()).default({}),
  objectivesJson: z.array(z.string()).default([]),
  learningObjectivesJson: z.array(z.string()).default([]),
  rubricId: z.string().min(1, 'Rubric is required'),
  competencyId: z.string().min(1, 'Competency is required'),
});

export const updateCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long').optional(),
  culturalContextJson: z.record(z.any()).optional(),
  objectivesJson: z.array(z.string()).optional(),
  learningObjectivesJson: z.array(z.string()).optional(),
  rubricId: z.string().min(1, 'Rubric is required').optional(),
  competencyId: z.string().min(1, 'Competency is required').optional(),
});

export const updatePersonaSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  avatarId: z.string().min(1, 'Avatar ID is required').optional(),
  voiceId: z.string().min(1, 'Voice ID is required').optional(),
  promptTemplate: z.string().min(1, 'Prompt template is required').optional(),
  backgroundJson: z.record(z.any()).optional(),
  safetyJson: z.record(z.any()).optional(),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
export type UpdatePersonaInput = z.infer<typeof updatePersonaSchema>;