import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import recordRoutes from './routes/record.routes'
import dashboardRoutes from './routes/dashboard.routes'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(cors())
app.use(express.json())

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finflow API',
      version: '1.0.0',
      description: 'Finance Dashboard System — Backend API',
    },
    servers: [{ url: `http://localhost:${PORT}`, description: 'Development' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management (admin only)' },
      { name: 'Records', description: 'Financial record management' },
      { name: 'Dashboard', description: 'Aggregated analytics' },
    ],
  },
  apis: ['./src/routes/*.ts'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Finflow API Docs',
}))
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/records', recordRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Finflow API running', timestamp: new Date().toISOString() })
})

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist')
  app.use(express.static(frontendPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'))
  })
}

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`Finflow API running on http://localhost:${PORT}`)
  console.log(`Swagger docs at  http://localhost:${PORT}/api-docs`)
})

export default app
