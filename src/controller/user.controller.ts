import { NextFunction, Request, Response } from 'express'
import { IUpdateUserRequestBody, IUser } from '../types/user.types'
import { validateJoiSchema } from '../validation/auth.validation'
import { ValidateUpdateUserBody } from '../validation/user.validation'
import httpError from '../util/httpError'
import responseMessage from '../constant/responseMessage'
import httpResponse from '../util/httpResponse'
import { uploadToCloudinary } from '../util/fileUpload'
import userDatabase from '../service/database/user.database'

interface IUpdateUserRequest extends Request {
  body: IUpdateUserRequestBody
}

export default {
  getAllUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract pagination and filtering params
      const page = parseInt(req.query.page as string) || 0
      const pageSize = parseInt(req.query.pageSize as string) || 10
      const sortField = (req.query.sortField as string) || 'createdAt'
      const sortOrder = (req.query.sortOrder as string) || 'desc'
      const searchTerm = req.query.searchTerm as string
      const role = req.query.role as string

      // Build query conditions
      const query: any = {}

      if (searchTerm) {
        query.$or = [{ name: { $regex: searchTerm, $options: 'i' } }, { emailAddress: { $regex: searchTerm, $options: 'i' } }]
      }

      if (role) {
        query.role = role
      }

      // Get total count for pagination
      const totalCount = await userDatabase.getAllUsersCount(query)

      // Fetch data with pagination, sorting and selected fields
      const users = await userDatabase
        .getAllUsers(query)
        .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
        .skip(page * pageSize)
        .limit(pageSize)
        .select('-password') // Exclude password from results

      // Return with pagination metadata
      if (!users || users.length === 0) {
        return httpResponse(req, res, 404, responseMessage.NOT_FOUND('Users'))
      }

      httpResponse(req, res, 200, responseMessage.SUCCESS, {
        items: users,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize)
      })
    } catch (err) {
      httpError(next, err, req, 500)
    }
  },

  getUserDetails: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      if (!id) {
        return httpResponse(req, res, 404, responseMessage.INVALID_REQUEST)
      }

      const user = await userDatabase.findUserById(id)
      if (!user) {
        return httpResponse(req, res, 404, responseMessage.NOT_FOUND('User'))
      }

      // Remove sensitive information
      const userResponse = {
        ...user.toObject(),
        password: undefined,
        accountConfirmation: undefined,
        passwordReset: undefined
      }

      httpResponse(req, res, 200, responseMessage.SUCCESS, userResponse)
    } catch (err) {
      httpError(next, err, req, 500)
    }
  },

  updateUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const { body } = req as IUpdateUserRequest

      // If a profile photo was uploaded, process it
      if (req.file) {
        const imageUrl = await uploadToCloudinary(req.file.path)
        body.profile_image = imageUrl
      }

      // * Body Validation
      const { error, value } = validateJoiSchema<IUpdateUserRequestBody>(ValidateUpdateUserBody, body)
      if (error) {
        return httpError(next, error, req, 422)
      }

      const user = await userDatabase.findUserById(id)
      if (!user) {
        return httpResponse(req, res, 404, responseMessage.NOT_FOUND('User'))
      }

      // Extract updatable fields
      const { name, phoneNumber, profile_image } = value

      const payload: Partial<IUser> = {
        name,
        phoneNumber,
        profile_image: profile_image || user.profile_image || null
      }

      const updatedUser = await userDatabase.updateUser(id, payload)
      if (!updatedUser) {
        return httpError(next, new Error(responseMessage.NOT_FOUND('User')), req, 404)
      }

      httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'User updated successfully' })
    } catch (err) {
      httpError(next, err, req, 500)
    }
  },

  deleteUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params

      const deletedUser = await userDatabase.deleteUser(id)
      if (!deletedUser) {
        return httpError(next, new Error(responseMessage.NOT_FOUND('User')), req, 404)
      }

      httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'User deleted successfully' })
    } catch (err) {
      httpError(next, err, req, 500)
    }
  }
}
