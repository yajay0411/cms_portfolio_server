import express, { Application, NextFunction, Request, Response } from 'express';
import router from './router/api.routes';
import globalErrorHandler from './middleware/globalErrorHandler';
import responseMessage from './constant/responseMessage';
import httpError from './util/httpError';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config/app.config';
import { EApplicationEnvironment } from './constant/application';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.config';
import basicAuth from 'express-basic-auth';

const app: Application = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);
app.use(cookieParser());

const devDomain = ['http://localhost:4173', 'http://localhost:5173'];
app.use(
  cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    origin: [config.CLIENT_URL, ...devDomain],
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST Routes
app.use('/api/v1', router);

// Home Route
app.get('/', (_req: Request, res: Response) => {
  res.send(`SERVER IS RUNNING: ${config.SERVER_URL}`);
});

// Swagger (development and production)
if (config.ENV === EApplicationEnvironment.DEVELOPMENT) {
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} else {
  if (config.SWAGGER_USER && config.SWAGGER_PASS) {
    app.use(
      '/api/v1/docs',
      basicAuth({
        users: { [config.SWAGGER_USER]: config.SWAGGER_PASS },
        challenge: true
      }),
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec)
    );
  }
}

// 404 Handler
app.use((req: Request, _: Response, next: NextFunction) => {
  try {
    throw new Error(responseMessage.NOT_FOUND('route'));
  } catch (err) {
    httpError(next, err, req, 404);
  }
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
