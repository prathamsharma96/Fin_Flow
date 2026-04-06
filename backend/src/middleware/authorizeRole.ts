import { Request, Response, NextFunction } from 'express'

type Role = 'VIEWER' | 'ANALYST' | 'ADMIN'

const ROLE_HIERARCHY: Record<Role, number> = {
  VIEWER: 1,
  ANALYST: 2,
  ADMIN: 3,
}

export const authorizeRole =
  (...allowedRoles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user

    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' })
      return
    }

    const userLevel = ROLE_HIERARCHY[user.role]
    const hasAccess = allowedRoles.some((role) => userLevel >= ROLE_HIERARCHY[role])

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required: ${allowedRoles.join(' or ')}`,
      })
      return
    }

    next()
  }
