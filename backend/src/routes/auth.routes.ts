import { Router, Request, Response } from 'express'
import { authService } from '../services/auth.service'
import { validate } from '../middleware/validate'
import { authenticate } from '../middleware/authenticate'
import { loginSchema, registerSchema } from '../schemas'

const router = Router()

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: John Doe }
 *               email: { type: string, example: john@example.com }
 *               password: { type: string, example: secret123 }
 *               role: { type: string, enum: [VIEWER, ANALYST, ADMIN], example: VIEWER }
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or email already in use
 */
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body)
    res.status(201).json({ success: true, data: result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed'
    res.status(400).json({ success: false, message })
  }
})

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: admin@finflow.com }
 *               password: { type: string, example: admin123 }
 *     responses:
 *       200:
 *         description: Login successful, returns token
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body)
    res.json({ success: true, data: result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed'
    res.status(401).json({ success: false, message })
  }
})

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await authService.me(req.user!.id)
    res.json({ success: true, data: user })
  } catch {
    res.status(404).json({ success: false, message: 'User not found' })
  }
})

export default router
