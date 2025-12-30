import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().default(''),
  username: z.string().default(''),
  phone: z.string().default(''),
  email: z.string().default(''),
  role: z.enum(['user', 'admin', 'premium', 'metro_streamer']).or(z.string()),
  status: z.enum(['active', 'inactive']).or(z.string()),
  points: z.number().int().default(0),
  joinDate: z.string().optional(),
});

export const UsersPageSchema = z.object({
  success: z.boolean(),
  data: z.object({
    users: z.array(UserSchema),
    pagination: z.object({
      page: z.number().int(),
      limit: z.number().int(),
      total: z.number().int(),
    }),
  }),
  error: z.any().nullable(),
  meta: z.object({ timestamp: z.string() }).passthrough().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type UsersPage = z.infer<typeof UsersPageSchema>;


