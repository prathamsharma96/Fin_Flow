import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export const validate =
  (schema: ZodSchema, source: 'body' | 'query' = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(source === 'body' ? req.body : req.query)
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      res.status(400).json({ success: false, message: 'Validation failed', errors })
      return
    }
    if (source === 'body') req.body = result.data
    next()
  }
