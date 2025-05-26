import { Request, Response } from 'express'
import { THttpError } from '../types/types'

export default (err: THttpError, _req: Request, res: Response) => {
  res.status(err.statusCode).json(err)
}
