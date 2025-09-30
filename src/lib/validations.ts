import { z } from 'zod';

export const createCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  culturalContextJson: z.any().refine((val) => {
    try {
      if (typeof val === 'string') {
        JSON.parse(val);
      }
      return true;
    } catch {
      return false;
    }
  }, 'Invalid JSON format'),
  objectivesJson: z.any().refine((val) => {
    try {
      if (typeof val === 'string') {
        JSON.parse(val);
      }
      return true;
    } catch {
      return false;
    }
  }, 'Invalid JSON format'),
  rubricId: z.string().min(1, 'Rubric is required'),
});

export const updateCaseSchema = createCaseSchema.partial();

export const updatePersonaSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  voiceId: z.string().min(1, 'Voice is required').optional(),
  avatarId: z.string().min(1, 'Avatar is required').optional(),
  promptTemplate: z.string().min(1, 'Prompt template is required').optional(),
  backgroundJson: z.any().optional(),
  safetyJson: z.any().optional(),
});

export const generatePersonaSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  avatarId: z.string().min(1, 'Avatar is required'),
  voiceId: z.string().min(1, 'Voice is required'),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
export type UpdatePersonaInput = z.infer<typeof updatePersonaSchema>;
export type GeneratePersonaInput = z.infer<typeof generatePersonaSchema>;
