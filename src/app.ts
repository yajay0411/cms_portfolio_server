import express, { Application, NextFunction, Request, Response } from 'express'
import path from 'path'
import router from './router/api.routes'
import globalErrorHandler from './middleware/globalErrorHandler'
import responseMessage from './constant/responseMessage'
import httpError from './util/httpError'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import config from './config/config'

const app: Application = express()

// Middleware
app.use(helmet())
app.use(cookieParser())
app.use(
  cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    origin: [config.CLIENT_URL],
    credentials: true
  })
)
app.use(express.json())
app.use(express.static(path.join(__dirname, '../', 'public')))

// Routes
app.use('/api/v1', router)

// 404 Handler
app.use((req: Request, _: Response, next: NextFunction) => {
  try {
    throw new Error(responseMessage.NOT_FOUND('route'))
  } catch (err) {
    httpError(next, err, req, 404)
  }
})

// Global Error Handler
app.use(globalErrorHandler)

export default app
