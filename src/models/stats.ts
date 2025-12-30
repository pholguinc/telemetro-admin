import { z } from 'zod';

export const AdminStatsSchema = z.object({
  success: z.boolean(),
  data: z.object({
    users: z.object({ total: z.number().int(), active: z.number().int() }),
    banners: z.object({ total: z.number().int(), active: z.number().int() }),
    games: z.object({ total: z.number().int(), active: z.number().int() }).partial(),
    jobs: z.object({ total: z.number().int(), active: z.number().int() }).partial(),
  }),
  error: z.any().nullable(),
  meta: z.object({ timestamp: z.string() }).passthrough().optional(),
});

export type AdminStats = z.infer<typeof AdminStatsSchema>;


