import { NextFunction, Request, Response } from 'express';
import httpResponse from '../util/httpResponse';
import responseMessage from '../constant/responseMessage';
import httpError from '../util/httpError';
import system from '../util/system';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export default {
  self: (req: Request, res: Response, next: NextFunction): void => {
    try {
      httpResponse(req, res, 200, responseMessage.SUCCESS);
    } catch (err) {
      httpError(next, err, req, 500);
    }
  },

  health: (req: Request, res: Response, next: NextFunction): void => {
    try {
      const healthData = {
        application: system.getApplicationHealth(),
        system: system.getSystemHealth(),
        timestamp: Date.now()
      };

      httpResponse(req, res, 200, responseMessage.SUCCESS, healthData);
    } catch (err) {
      httpError(next, err, req, 500);
    }
  }
};
