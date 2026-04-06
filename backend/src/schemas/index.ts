import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
})

export const createRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  date: z.string().datetime({ message: 'Invalid date format' }),
  notes: z.string().optional(),
})

export const updateRecordSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().min(1).optional(),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
})

export const recordQuerySchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateRecordInput = z.infer<typeof createRecordSchema>
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>
export type RecordQueryInput = z.infer<typeof recordQuerySchema>
