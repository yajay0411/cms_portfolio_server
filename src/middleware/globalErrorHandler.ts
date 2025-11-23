import { THttpError } from '@/types/response.type';
import { Request, Response, NextFunction } from 'express';

export default (err: THttpError, _req: Request, res: Response, _next: NextFunction): Response => {
  void _next;
  void _req;
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json(err);
};
