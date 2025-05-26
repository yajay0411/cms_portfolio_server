import { NextFunction, Request } from 'express'
import responseMessage from '../constant/responseMessage'
import config from '../config/config'
import { EApplicationEnvironment, TApplicationEnvironment } from '../constant/application'
import logger from './logger'
import { THttpError } from '../types/types'

export default (nextFunc: NextFunction, err: Error | unknown, req: Request, errorStatusCode: number = 500): void => {
  const errorObj: THttpError = {
    success: false,
    statusCode: errorStatusCode,
    request: {
      ip: req.ip || null,
      method: req.method,
      url: req.originalUrl,
      user: null
    },
    message: err instanceof Error ? err.message || responseMessage.SOMETHING_WENT_WRONG : responseMessage.SOMETHING_WENT_WRONG,
    data: null,
    trace: err instanceof Error ? { error: err.stack } : null
  }

  // Log
  logger.error(`CONTROLLER_ERROR`, {
    meta: errorObj
  })

  // Production Env check
  if ((config.ENV as TApplicationEnvironment) === EApplicationEnvironment.PRODUCTION) {
    delete errorObj.request.ip
    delete errorObj.trace
  }

  return nextFunc(errorObj)
}
