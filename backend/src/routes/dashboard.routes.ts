import { Router, Request, Response } from 'express'
import { dashboardService } from '../services/dashboard.service'
import { authenticate } from '../middleware/authenticate'
import { authorizeRole } from '../middleware/authorizeRole'

const router = Router()

router.use(authenticate)

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get financial summary (income, expense, net balance)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary data
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const data = await dashboardService.getSummary(req.user!)
    res.json({ success: true, data })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch summary' })
  }
})

/**
 * @swagger
 * /api/dashboard/trends:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get monthly income vs expense trends (analyst and above)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly trend data for last 6 months
 */
router.get('/trends', authorizeRole('ANALYST'), async (req: Request, res: Response) => {
  try {
    const data = await dashboardService.getTrends(req.user!)
    res.json({ success: true, data })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch trends' })
  }
})

/**
 * @swagger
 * /api/dashboard/categories:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get totals grouped by category
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category breakdown
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const data = await dashboardService.getCategories(req.user!)
    res.json({ success: true, data })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' })
  }
})

export default router
