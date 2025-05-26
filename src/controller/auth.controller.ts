import { NextFunction, Request, Response } from 'express'
import httpResponse from '../util/httpResponse'
import responseMessage from '../constant/responseMessage'
import httpError from '../util/httpError'
import quicker from '../util/quicker'
import {
  ValidateChangePasswordBody,
  ValidateForgotPasswordBody,
  validateJoiSchema,
  ValidateLoginBody,
  ValidateRegisterBody,
  ValidateResetPasswordBody
} from '../validation/auth.validation'
import {
  IChangePasswordRequestBody,
  IDecryptedJwt,
  IForgotPasswordRequestBody,
  ILoginUserRequestBody,
  IRefreshToken,
  IRegisterUserRequestBody,
  IResetPasswordRequestBody
} from '../types/auth.types'
import { IUser, IUserWithId } from '../types/user.types'
import { EUserRole } from '../constant/userConstant'
import config from '../config/config'
import emailService from '../service/emailService'
import logger from '../util/logger'
import dayjs from 'dayjs'
import { EApplicationEnvironment, EStorageKey } from '../constant/application'
import authDatabase from '../service/database/auth.database'
import userDatabase from '../service/database/user.database'
import { uploadToCloudinary } from '../util/fileUpload'

interface IRegisterRequest extends Request {
  body: IRegisterUserRequestBody
}

interface IConfirmRequest extends Request {
  params: {
    token: string
  }
  query: {
    code: string
  }
}

interface ILoginRequest extends Request {
  body: ILoginUserRequestBody
}

interface ISelfIdentificationRequest extends Request {
  authenticatedUser: IUser
}

interface IForgotPasswordRequest extends Request {
  body: IForgotPasswordRequestBody
}

interface IResetPasswordRequest extends Request {
  params: {
    token: string
  }
  body: IResetPasswordRequestBody
}

interface IChangePasswordRequest extends Request {
  authenticatedUser: IUserWithId
  body: IChangePasswordRequestBody
}

export default {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = req as IRegisterRequest

      // If a new file was uploaded, process it
      if (req.file) {
        const imageUrl = await uploadToCloudinary(req.file.path, 'profile')
        body.profile_image = imageUrl
      }

      // * Body Validation
      const { error, value } = validateJoiSchema<IRegisterUserRequestBody>(ValidateRegisterBody, body)
      if (error) {
        return httpError(next, error, req, 422)
      }

      // Destructure Value
      const { name, emailAddress, password, phoneNumber, consent, profile_image } = value

      // * Check User Existence using Email Address
      const user = await userDatabase.findUserByEmailAddress(emailAddress)
      if (user) {
        return httpError(next, new Error(responseMessage.ALREADY_EXIST('user', emailAddress)), req, 403)
      }

      // * Phone Number Validation & Parsing
      const { countryCode, isoCode, internationalNumber } = quicker.parsePhoneNumber(`+91` + phoneNumber)

      if (!countryCode || !isoCode || !internationalNumber) {
        return httpError(next, new Error(responseMessage.INVALID_PHONE_NUMBER), req, 422)
      }

      // * Timezone
      const timezone = quicker.countryTimezone(isoCode)

      if (!timezone || timezone.length === 0) {
        return httpError(next, new Error(responseMessage.INVALID_PHONE_NUMBER), req, 422)
      }

      // * Encrypting Password
      const encryptedPassword = await quicker.hashPassword(password)

      // * Account Confirmation Object
      const token = quicker.generateRandomId()
      const code = quicker.generateOtp(6)

      // * Preparing Object
      const payload: IUser = {
        name,
        emailAddress,
        profile_image: profile_image || null,
        phoneNumber: {
          countryCode: countryCode,
          isoCode: isoCode,
          internationalNumber: internationalNumber
        },
        accountConfirmation: {
          status: false,
          token,
          code: code,
          timestamp: null
        },
        passwordReset: {
          token: null,
          expiry: null,
          lastResetAt: null
        },
        lastLoginAt: null,
        role: EUserRole.USER,
        timezone: timezone[0].name,
        password: encryptedPassword,
        consent
      }

      // Create New User
      const newUser = await userDatabase.registerUser(payload)

      // * Send Email
      const confirmationUrl = `${config.CLIENT_URL}/confirmation/${token}?code=${code}`
      const to = [emailAddress]
      const subject = 'Confirm Your Account'
      const html = await emailService.renderTemplate('verify_account', {
        name: newUser.name,
        confirmationUrl: confirmationUrl
      })

      emailService.sendEmail(to, subject, html).catch((err) => {
        logger.error(`EMAIL_SERVICE`, {
          meta: err
        })
      })

      // Send Response
      httpResponse(req, res, 201, responseMessage.SUCCESS, { _id: newUser._id, user: newUser })
    } catch (err) {
      httpError(next, err, req, 500)
    }
  },

  confirmation: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params, query } = req as IConfirmRequest

      const { token } = params
      const { code } = query

      // * Fetch User By Token & Code
      const user = await userDatabase.findUserByConfirmationTokenAndCode(token, code)
      if (!user) {
        return httpError(next, new Error(responseMessage.INVALID_ACCOUNT_CONFIRMATION_TOKEN_OR_CODE), req, 400)
      }

      // * Check if Account already confirmed
      if (user.accountConfirmation.status) {
        return httpResponse(req, res, 200, responseMessage.ACCOUNT_ALREADY_CONFIRMED)
      }

      // * Account confirm
      user.accountConfirmation.status = true
      user.accountConfirmation.timestamp = dayjs().utc().toDate()

      await user.save()

      // * Account Confirmation Email
      const to = [user.emailAddress]
      const subject = 'Account Confirmed'
      const html = 'Account has been confirmed successfully'
      emailService.sendEmail(to, subject, html).catch((err) => {
        logger.error(`EMAIL_SERVICE`, {
          meta: err
        })
      })

      httpResponse(req, res, 200, responseMessage.SUCCESS)
    } catch (err) {
      httpError(next, err, req, 500)
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = req as ILoginRequest

      // * Validate & parse body
      const { error, value } = validateJoiSchema<ILoginUserRequestBody>(ValidateLoginBody, body)
      if (error) {
        return httpError(next, error, req, 422)
      }

      const { emailAddress, password } = value

      // * Find User
      const user = await userDatabase.findUserByEmailAddress(emailAddress, `+password`)
      if (!user) {
        return httpError(next, new Error(responseMessage.NOT_FOUND('user')), req, 404)
      }

      // * Validate account status
      if (!user.accountConfirmation.status) {
        // * Account Confirmation Object
        const token = quicker.generateRandomId()
        const code = quicker.generateOtp(6)

        // * Send Email
        const confirmationUrl = `${config.CLIENT_URL}/confirmation/${token}?code=${code}`
        const to = [emailAddress]
        const subject = 'Confirm Your Account'
        const html = await emailService.renderTemplate('verify_account', {
          name: user.name,
          confirmationUrl: confirmationUrl
        })

        emailService.sendEmail(to, subject, html).catch((err) => {
          logger.error(`EMAIL_SERVICE`, {
            meta: err
          })
        })
        return httpError(next, new Error(responseMessage.ACCOUNT_CONFIRMATION_REQUIRED), req, 400)
      }

      // * Validate Password
      const isValidPassword = await quicker.comparePassword(password, user.password)
      if (!isValidPassword) {
        return httpError(next, new Error(responseMessage.INVALID_EMAIL_OR_PASSWORD), req, 400)
      }

      // * Access Token & Refresh Token
      const client_AccessToken = quicker.generateToken(
        {
          userId: user.id
        },
        config.CLIENT_ACCESS_TOKEN.SECRET,
        config.CLIENT_ACCESS_TOKEN.EXPIRY
      )

      const api_AccessToken = quicker.generateToken(
        {
          userId: user.id
        },
        config.API_ACCESS_TOKEN.SECRET,
        config.API_ACCESS_TOKEN.EXPIRY
      )

      const api_RefreshToken = quicker.generateToken(
        {
          userId: user.id
        },
        config.API_REFRESH_TOKEN.SECRET,
        config.API_REFRESH_TOKEN.EXPIRY
      )

      // * Last Login Information
      user.lastLoginAt = dayjs().utc().toDate()
      await user.save()

      // * Refresh Token Store
      const refreshTokenPayload: IRefreshToken = {
        token: api_RefreshToken
      }

      await authDatabase.createRefreshToken(refreshTokenPayload)

      // * Cookie Send
      const DOMAIN = quicker.getDomainFromUrl(config.SERVER_URL)

      res
        .cookie(EStorageKey.CLIENT_ACCESS_TOKEN, client_AccessToken, {
          path: '/',
          domain: DOMAIN,
          sameSite: 'strict',
          maxAge: 1000 * config.CLIENT_ACCESS_TOKEN.EXPIRY,
          httpOnly: false,
          secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
        })
        .cookie(EStorageKey.API_ACCESS_TOKEN, api_AccessToken, {
          path: '/',
          domain: DOMAIN,
          sameSite: 'strict',
          maxAge: 1000 * config.API_ACCESS_TOKEN.EXPIRY,
          httpOnly: true,
          secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
        })
        .cookie(EStorageKey.API_REFRESH_TOKEN, api_RefreshToken, {
          path: '/',
          domain: DOMAIN,
          sameSite: 'strict',
          maxAge: 1000 * config.API_REFRESH_TOKEN.EXPIRY,
          httpOnly: true,
          secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
        })

      // Send Response
      httpResponse(req, res, 201, responseMessage.SUCCESS, { user: user })
    } catch (err) {
      httpError(next, err, req, 500)
    }
  },

  selfIdentification: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = req as ISelfIdentificationRequest
      const { cookies } = request
      const { apiOnly_AccessToken } = cookies as {
        apiOnly_AccessToken: string | undefined
      }

      if (!apiOnly_AccessToken) {
        return httpError(next, new Error(responseMessage.INVALID_ACCOUNT_CONFIRMATION_TOKEN_OR_CODE), req, 400)
      }

      const { userId } = quicker.verifyToken(apiOnly_AccessToken, config.API_ACCESS_TOKEN.SECRET) as IDecryptedJwt
      if (!userId) {
        return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401)
      }

      // Find User by id
      const user = await userDatabase.findUserById(userId)
      if (!user) {
        // Cookies clear
        const DOMAIN = quicker.getDomainFromUrl(config.SERVER_URL)
        res
          .clearCookie(EStorageKey.CLIENT_ACCESS_TOKEN, {
            path: '/',
            domain: DOMAIN,
            sameSite: 'strict',
            maxAge: 1000 * config.CLIENT_ACCESS_TOKEN.EXPIRY,
            httpOnly: false,
            secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
          })
          .clearCookie(EStorageKey.API_ACCESS_TOKEN, {
            path: '/',
            domain: DOMAIN,
            sameSite: 'strict',
            maxAge: 1000 * config.API_ACCESS_TOKEN.EXPIRY,
            httpOnly: true,
            secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
          })

          .clearCookie(EStorageKey.API_REFRESH_TOKEN, {
            path: '/',
            domain: DOMAIN,
            sameSite: 'strict',
            maxAge: 1000 * config.API_REFRESH_TOKEN.EXPIRY,
            httpOnly: true,
            secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
          })
        return httpError(next, new Error(responseMessage.INVALID_ACCOUNT_CONFIRMATION_TOKEN_OR_CODE), req, 400)
      }

      return httpResponse(req, res, 200, responseMessage.SUCCESS, user)
    } catch (err) {
      httpError(next, err, req, 500)
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cookies } = req
      const { refreshToken } = cookies as {
        refreshToken: string | undefined
      }

      if (refreshToken) {
        // db -> delete the refresh token
        await authDatabase.deleteRefreshToken(refreshToken)
      }

      const DOMAIN = quicker.getDomainFromUrl(config.SERVER_URL)

      // Cookies clear
      res
        .clearCookie(EStorageKey.CLIENT_ACCESS_TOKEN, {
          path: '/',
          domain: DOMAIN,
          sameSite: 'strict',
          maxAge: 1000 * config.CLIENT_ACCESS_TOKEN.EXPIRY,
          httpOnly: false,
          secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
        })

        .clearCookie(EStorageKey.API_ACCESS_TOKEN, {
          path: '/',
          domain: DOMAIN,
          sameSite: 'strict',
          maxAge: 1000 * config.API_ACCESS_TOKEN.EXPIRY,
          httpOnly: true,
          secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
        })

        .clearCookie(EStorageKey.API_REFRESH_TOKEN, {
          path: '/',
          domain: DOMAIN,
          sameSite: 'strict',
          maxAge: 1000 * config.API_REFRESH_TOKEN.EXPIRY,
          httpOnly: true,
          secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
        })

      httpResponse(req, res, 200, responseMessage.SUCCESS)
    } catch (err) {
      httpError(next, err, req, 500)
    }
  },

  refreshToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cookies } = req

      const { apiOnly_RefreshToken } = cookies as {
        apiOnly_RefreshToken: string | undefined
      }

      if (apiOnly_RefreshToken) {
        // fetch token from db
        const rft = await authDatabase.findRefreshToken(apiOnly_RefreshToken)
        if (!rft) {
          return httpError(next, new Error(responseMessage.INVALID_TOKEN), req, 400)
        }

        const DOMAIN = quicker.getDomainFromUrl(config.SERVER_URL)
        let userId: null | string = null

        try {
          const decryptedJwt = quicker.verifyToken(apiOnly_RefreshToken, config.API_REFRESH_TOKEN.SECRET) as IDecryptedJwt
          userId = decryptedJwt.userId
        } catch {
          userId = null
        }

        if (userId) {
          // * Access Token
          const accessToken = quicker.generateToken(
            {
              userId: userId
            },
            config.API_ACCESS_TOKEN.SECRET,
            config.API_ACCESS_TOKEN.EXPIRY
          )

          // Generate new Access Token
          res.cookie(EStorageKey.API_ACCESS_TOKEN, accessToken, {
            path: '/',
            domain: DOMAIN,
            sameSite: 'strict',
            maxAge: 1000 * config.API_ACCESS_TOKEN.EXPIRY,
            httpOnly: true,
            secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
          })

          return httpResponse(req, res, 200, responseMessage.SUCCESS, {
            accessToken
          })
        }
      }

      httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401)
    } catch (err) {
      httpError(next, err, req, 500)
    }
  },

  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = req as IForgotPasswordRequest

      const { error, value } = validateJoiSchema<IForgotPasswordRequestBody>(ValidateForgotPasswordBody, body)
      if (error) {
        return httpError(next, error, req, 422)
      }

      const { emailAddress } = value

      const user = await userDatabase.findUserByEmailAddress(emailAddress)
      if (!user) {
        return httpError(next, new Error(responseMessage.NOT_FOUND('user')), req, 404)
      }

      if (!user.accountConfirmation.status) {
        return httpError(next, new Error(responseMessage.ACCOUNT_CONFIRMATION_REQUIRED), req, 400)
      }

      const token = quicker.generateRandomId()
      const expiry = quicker.generateResetPasswordExpiry(15)

      user.passwordReset.token = token
      user.passwordReset.expiry = expiry

      await user.save()

      // Send Email
      const resetUrl = `${config.CLIENT_URL}/reset-password/${token}`
      const to = [emailAddress]
      const subject = 'Account Password Reset Requested'
      const html = `Hey ${user.name}, Please reset your account password by clicking on the link below\n\nLink will expire within 15 Minutes\n\n${resetUrl}`

      emailService.sendEmail(to, subject, html).catch((err) => {
        logger.error(`EMAIL_SERVICE`, {
          meta: err
        })
      })

      httpResponse(req, res, 200, responseMessage.SUCCESS)
    } catch (err) {
      httpError(next, err, req, 500)
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body, params } = req as IResetPasswordRequest
      const { token } = params

      const { error, value } = validateJoiSchema<IResetPasswordRequestBody>(ValidateResetPasswordBody, body)
      if (error) {
        return httpError(next, error, req, 422)
      }

      const { newPassword } = value

      const user = await userDatabase.findUserByResetToken(token)
      if (!user) {
        return httpError(next, new Error(responseMessage.NOT_FOUND('user')), req, 404)
      }

      if (!user.accountConfirmation.status) {
        return httpError(next, new Error(responseMessage.ACCOUNT_CONFIRMATION_REQUIRED), req, 400)
      }

      const storedExpiry = user.passwordReset.expiry
      const currentTimestamp = dayjs().valueOf()

      if (!storedExpiry) {
        return httpError(next, new Error(responseMessage.INVALID_REQUEST), req, 400)
      }

      if (currentTimestamp > storedExpiry) {
        return httpError(next, new Error(responseMessage.EXPIRED_URL), req, 400)
      }

      const hashedPassword = await quicker.hashPassword(newPassword)

      user.password = hashedPassword

      user.passwordReset.token = null
      user.passwordReset.expiry = null
      user.passwordReset.lastResetAt = dayjs().utc().toDate()
      await user.save()

      // * Email send
      const to = [user.emailAddress]
      const subject = 'Account Password Reset'
      const html = `Hey ${user.name}, You account password has been reset successfully.`

      emailService.sendEmail(to, subject, html).catch((err) => {
        logger.error(`EMAIL_SERVICE`, {
          meta: err
        })
      })

      httpResponse(req, res, 200, responseMessage.SUCCESS)
    } catch (err) {
      httpError(next, err, req, 500)
    }
  },

  // not consumed
  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body, authenticatedUser } = req as IChangePasswordRequest

      const { error, value } = validateJoiSchema<IChangePasswordRequestBody>(ValidateChangePasswordBody, body)
      if (error) {
        return httpError(next, error, req, 422)
      }

      // * Find User by id
      const user = await userDatabase.findUserById(authenticatedUser._id, '+password')
      if (!user) {
        return httpError(next, new Error(responseMessage.NOT_FOUND('user')), req, 404)
      }

      const { newPassword, oldPassword } = value

      // * Check if old password is matching with stored password
      const isPasswordMatching = await quicker.comparePassword(oldPassword, user.password)
      if (!isPasswordMatching) {
        return httpError(next, new Error(responseMessage.INVALID_OLD_PASSWORD), req, 400)
      }

      if (newPassword === oldPassword) {
        return httpError(next, new Error(responseMessage.PASSWORD_MATCHING_WITH_OLD_PASSWORD), req, 400)
      }

      // * Password hash for new password
      const hashedPassword = await quicker.hashPassword(newPassword)

      // * User update
      user.password = hashedPassword
      await user.save()

      // * Email Send
      // const to = [user.emailAddress]
      // const subject = 'Password Changed'
      // const text = `Hey ${user.name}, You account password has been changed successfully.`

      // emailService.sendEmail(to, subject, text).catch((err) => {
      //   logger.error(`EMAIL_SERVICE`, {
      //     meta: err
      //   })
      // })

      httpResponse(req, res, 200, responseMessage.SUCCESS)
    } catch (err) {
      httpError(next, err, req, 500)
    }
  }
}
