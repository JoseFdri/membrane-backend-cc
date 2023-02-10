import express, { Express } from 'express'
import { setupRoutes } from './'

export const setupApp = (): Express => {
  const app = express()

  // setup middlewares, routes, etc
  app.use(express.json())
  setupRoutes(app)

  return app
}
