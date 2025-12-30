import { z } from 'zod';

export const VotoPartiesSchema = z.object({
  success: z.boolean(),
  data: z.object({
    parties: z.array(z.any()),
    pagination: z.object({ page: z.number().int(), limit: z.number().int(), total: z.number().int(), pages: z.number().int() }),
  }),
  error: z.any().nullable(),
  meta: z.object({ timestamp: z.string() }).passthrough().optional(),
});

export type VotoParties = z.infer<typeof VotoPartiesSchema>;


