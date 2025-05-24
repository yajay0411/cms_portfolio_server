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
import { graphqlHTTP } from 'express-graphql'
import { loadFilesSync } from '@graphql-tools/load-files'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { formatErrorResponse } from './util/ErrorGQL'

const app: Application = express()

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'"
        ],
        'style-src': [
          "'self'",
          "'unsafe-inline'"
        ]
      }
    },
    crossOriginEmbedderPolicy: false
  })
)
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

// Load GraphQL schema and resolvers
const typeDefs = loadFilesSync(path.join(__dirname, './graphql/schemes/**/*.graphql'))
const resolvers = loadFilesSync(path.join(__dirname, './graphql/resolvers/**/*.resolvers.ts'))

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

// GraphQL Middleware
app.use(
  '/api/v1/graphql',
  graphqlHTTP({
    schema,
    graphiql: config.ENV === 'development',
    customFormatErrorFn: (error) => formatErrorResponse(error, config.ENV === 'development'),
    extensions: ({ result }) => {
      if (result?.data) {
        return {
          success: true,
          timestamp: new Date().toISOString()
        }
      }
      return {}
    }
  })
)

// REST Routes
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
