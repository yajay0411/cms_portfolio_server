import { NextFunction, Request, Response } from 'express'
import { IUser } from '../types/user.types'
import quicker from '../util/quicker'
import config from '../config/config'
import { IDecryptedJwt } from '../types/auth.types'
import httpError from '../util/httpError'
import responseMessage from '../constant/responseMessage'
import userDatabase from '../service/database/user.database'

interface IAuthenticatedRequest extends Request {
  authenticatedUser: IUser
}

export default async (request: Request, _res: Response, next: NextFunction) => {
  try {
    const req = request as IAuthenticatedRequest

    const { cookies } = req

    const { apiOnly_AccessToken } = cookies as {
      apiOnly_AccessToken: string | undefined
    }

    if (apiOnly_AccessToken) {
      // Verify Token
      try {
        const { userId } = quicker.verifyToken(apiOnly_AccessToken, config.API_ACCESS_TOKEN.SECRET) as IDecryptedJwt
        if (!userId) {
          return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401)
        }

        // Find User by id
        const user = await userDatabase.findUserById(userId)
        if (user) {
          req.authenticatedUser = user
          return next()
        }
      } catch {
        httpError(next, new Error(responseMessage.INVALID_ACCOUNT_CONFIRMATION_TOKEN_OR_CODE), req, 401)
      }
    }

    httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401)
  } catch (err) {
    httpError(next, err, request, 500)
  }
}
