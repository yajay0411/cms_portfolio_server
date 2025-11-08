import { Request, Response } from 'express';
import { THttpResponse } from '../types/types';
import config from '../config/config';
import { EApplicationEnvironment, TApplicationEnvironment } from '../constant/application';
import logger from './logger';

export default (req: Request, res: Response, responseStatusCode: number, responseMessage: string, data: unknown = null): void => {
  const response: THttpResponse = {
    success: true,
    statusCode: responseStatusCode,
    request: {
      ip: req.ip || null,
      method: req.method,
      url: req.originalUrl,
      user: null
    },
    message: responseMessage,
    data: data
  };

  // Log
  logger.info(`CONTROLLER_SUCCESS_RESPONSE`, {
    meta: response
  });

  // Production Env check
  if ((config.ENV as TApplicationEnvironment) === EApplicationEnvironment.PRODUCTION) {
    delete response.request.ip;
  }

  res.status(responseStatusCode).json(response);
};
