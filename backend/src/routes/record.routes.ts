import { Router, Request, Response } from 'express'
import { recordService } from '../services/record.service'
import { authenticate } from '../middleware/authenticate'
import { authorizeRole } from '../middleware/authorizeRole'
import { validate } from '../middleware/validate'
import { createRecordSchema, updateRecordSchema, recordQuerySchema } from '../schemas'

const router = Router()

router.use(authenticate)

/**
 * @swagger
 * /api/records:
 *   get:
 *     tags: [Records]
 *     summary: Get financial records (paginated, filterable)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [income, expense] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 */
router.get('/', validate(recordQuerySchema, 'query'), async (req: Request, res: Response) => {
  try {
    const result = await recordService.getAll(req.user!, req.query as Record<string, string>)
    res.json({ success: true, data: result })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch records' })
  }
})

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     tags: [Records]
 *     summary: Get a single financial record
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
    const record = await recordService.getById(req.params.id, req.user!)
    res.json({ success: true, data: record })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Not found'
    res.status(404).json({ success: false, message })
  }
})

/**
 * @swagger
 * /api/records:
 *   post:
 *     tags: [Records]
 *     summary: Create a new financial record (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount: { type: number, example: 50000 }
 *               type: { type: string, enum: [income, expense] }
 *               category: { type: string, example: Salary }
 *               date: { type: string, format: date-time }
 *               notes: { type: string }
 */
router.post(
  '/',
  authorizeRole('ADMIN'),
  validate(createRecordSchema),
  async (req: Request, res: Response) => {
    try {
      const record = await recordService.create(req.body, req.user!.id)
      res.status(201).json({ success: true, data: record })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Create failed'
      res.status(400).json({ success: false, message })
    }
  }
)

/**
 * @swagger
 * /api/records/{id}:
 *   patch:
 *     tags: [Records]
 *     summary: Update a financial record (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.patch(
  '/:id',
  authorizeRole('ADMIN'),
  validate(updateRecordSchema),
  async (req: Request, res: Response) => {
    try {
      const record = await recordService.update(req.params.id, req.body, req.user!)
      res.json({ success: true, data: record })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Update failed'
      res.status(400).json({ success: false, message })
    }
  }
)

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     tags: [Records]
 *     summary: Soft delete a record (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.delete('/:id', authorizeRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    await recordService.softDelete(req.params.id)
    res.json({ success: true, message: 'Record deleted' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Delete failed'
    res.status(400).json({ success: false, message })
  }
})

export default router
