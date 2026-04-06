import { Router, Request, Response } from 'express'
import { userService } from '../services/user.service'
import { authenticate } from '../middleware/authenticate'
import { authorizeRole } from '../middleware/authorizeRole'
import { validate } from '../middleware/validate'
import { updateUserSchema } from '../schemas'

const router = Router()

router.use(authenticate, authorizeRole('ADMIN'))

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await userService.getAll()
    res.json({ success: true, data: users })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch users' })
  }
})

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await userService.getById(req.params.id)
    res.json({ success: true, data: user })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Not found'
    res.status(404).json({ success: false, message })
  }
})

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update user role or status (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               role: { type: string, enum: [VIEWER, ANALYST, ADMIN] }
 *               isActive: { type: boolean }
 */
router.patch('/:id', validate(updateUserSchema), async (req: Request, res: Response) => {
  try {
    const user = await userService.update(req.params.id, req.body)
    res.json({ success: true, data: user })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Update failed'
    res.status(400).json({ success: false, message })
  }
})

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Deactivate a user (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = await userService.remove(req.params.id)
    res.json({ success: true, data: user, message: 'User deactivated' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Delete failed'
    res.status(400).json({ success: false, message })
  }
})

export default router
