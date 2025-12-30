import { z } from 'zod';

export const BannerSchema = z.object({
  _id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  type: z.string(),
  status: z.string(),
  imageUrl: z.string(),
  backgroundColor: z.string(),
  textColor: z.string(),
  gradient: z.object({
    colors: z.array(z.string()),
    direction: z.string(),
  }).partial(),
  actionType: z.string().optional(),
  targetAudience: z.object({ roles: z.array(z.string()), location: z.array(z.string()) }).partial(),
  schedule: z.object({ startDate: z.string(), endDate: z.string(), timezone: z.string() }).partial(),
  impressions: z.number().int().optional(),
  clicks: z.number().int().optional(),
  metadata: z.object({ isAnimated: z.boolean().optional() }).partial(),
  isActive: z.boolean().optional(),
  priority: z.number().int().optional(),
  displayOrder: z.number().int().optional(),
  createdBy: z.object({ _id: z.string(), displayName: z.string().optional() }).partial(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const BannersResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(BannerSchema),
  error: z.any().nullable(),
  meta: z.object({ timestamp: z.string() }).passthrough().optional(),
});

export type Banner = z.infer<typeof BannerSchema>;
export type BannersResponse = z.infer<typeof BannersResponseSchema>;


