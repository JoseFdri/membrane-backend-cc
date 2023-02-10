import { Express, Router } from 'express'
import { orderRoute } from '../routes'

export const setupRoutes = (app: Express): void => {
  const router = Router()

  app.use('/api', router)

  orderRoute(router)
}
