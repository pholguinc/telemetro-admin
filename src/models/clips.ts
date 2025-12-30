import { z } from 'zod';

export const ClipsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.any()), // vacío en snapshot; se puede refinar luego
  error: z.any().nullable(),
  meta: z.object({
    timestamp: z.string(),
    pagination: z.object({ page: z.number().int(), limit: z.number().int(), total: z.number().int(), totalPages: z.number().int() })
  }).partial(),
});

export type ClipsResponse = z.infer<typeof ClipsResponseSchema>;


