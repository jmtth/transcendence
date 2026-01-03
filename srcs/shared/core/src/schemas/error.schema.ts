import z from 'zod';

export const ErrorSchema = z.object({
  message: z.string(),
});

export const ValidationErrorSchema = ErrorSchema.describe('Validation error');
