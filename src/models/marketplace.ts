import { z } from 'zod';

export const MarketplaceProductSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.string(),
  pointsCost: z.number().int(),
  stock: z.number().int(),
  imageUrl: z.string().optional(),
  provider: z.string().optional(),
  isActive: z.boolean().optional(),
  validityMinutes: z.number().int().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const MarketplaceListSchema = z.object({
  success: z.boolean(),
  data: z.array(MarketplaceProductSchema),
  error: z.any().nullable(),
  meta: z.object({
    timestamp: z.string(),
    pagination: z.object({ page: z.number().int(), limit: z.number().int(), total: z.number().int(), totalPages: z.number().int() })
  }).partial(),
});

export type MarketplaceProduct = z.infer<typeof MarketplaceProductSchema>;
export type MarketplaceList = z.infer<typeof MarketplaceListSchema>;


