import { NextFunction, Request, Response } from 'express'
import { ICreatePortfolioRequestBody, IPortfolio } from '../types/portfolio.types'
import { validateJoiSchema } from '../validation/auth.validation'
import { ValidateCreatePortfolioBody } from '../validation/portfolio.validation'
import httpError from '../util/httpError'
import responseMessage from '../constant/responseMessage'
import httpResponse from '../util/httpResponse'
import portfolioDatabase from '../service/database/portfolio.database'
import { uploadToCloudinary } from '../util/fileUpload'
import { IUserWithId } from '../types/user.types'
import mongoose from 'mongoose'

interface ICreatePortfolioRequest extends Request {
  body: ICreatePortfolioRequestBody
}

interface IAuthenticatedRequest extends Request {
  authenticatedUser: IUserWithId
}

export default {
  createPortfolio: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = req as ICreatePortfolioRequest;

      const request = req as IAuthenticatedRequest;

      // If a new file was uploaded, process it
      if (req.file) {
        const imageUrl = await uploadToCloudinary(req.file.path)
        body.landing_page_photo = imageUrl
      }  

      // * Body Validation
      const { error, value } = validateJoiSchema<ICreatePortfolioRequestBody>(ValidateCreatePortfolioBody, body)
      if (error) {
        return httpError(next, error, req, 422)
      }

      const { entity, name, summary, landing_page_photo } = value

      const payload: IPortfolio = {
        entity,
        name,
        summary,
        active: true,
        landing_page_photo: landing_page_photo || null,
        createdBy: new mongoose.Types.ObjectId(request.authenticatedUser._id)
      }

      // * Check Portfolio Existence using Entity ID
      const user = await portfolioDatabase.findByEntityId(entity)
      if (user) {
        return httpError(next, new Error(responseMessage.ALREADY_EXIST('Portfolio', entity)), req, 403)
      }

      const portfolio = await portfolioDatabase.createPortfolio(payload)
      if (!portfolio) {
        return httpError(next, new Error(responseMessage.SOMETHING_WENT_WRONG), req, 500)
      }

      httpResponse(req, res, 201, responseMessage.SUCCESS, { message: 'Portfolio created successfully' })
    } catch (err) {
      httpError(next, err, req, 500)
    }
  },
  getAllPortfolios: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract pagination and filtering params
      const page = parseInt(req.query.page as string) || 0
      const pageSize = parseInt(req.query.pageSize as string) || 10
      const sortField = (req.query.sortField as string) || 'createdAt'
      const sortOrder = (req.query.sortOrder as string) || 'desc'
      const searchTerm = req.query.searchTerm as string
      const status = req.query.status as string
      const user_id = req.query.user_id as string

      // Build query conditions
      const query: any = {}

      if (searchTerm) {
        query.name = { $regex: searchTerm, $options: 'i' }
      }

      if (status) {
        query.status = status
      }

      if (user_id) {
        query.createdBy = user_id
      }

      // Get total count for pagination
      const totalCount = await portfolioDatabase.getAllPortfoliosCount(query)

      // Fetch data with pagination, sorting and selected fields
      const portfolios = await portfolioDatabase
        .getAllPortfolios(query)
        .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
        .skip(page * pageSize)
        .limit(pageSize)

      // Return with pagination metadata
      if (!portfolios || portfolios.length === 0) {
        return httpResponse(req, res, 404, responseMessage.NOT_FOUND('Portfolios'))
      }

      httpResponse(req, res, 200, responseMessage.SUCCESS, {
        items: portfolios,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize)
      })
    } catch (err) {
      httpError(next, err, req, 500)
    }
  },
  getPortfolioDetails: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      if (!id) {
        return httpResponse(req, res, 404, responseMessage.INVALID_REQUEST)
      }

      const portfolio = await portfolioDatabase.getPortfolioDetail(id)
      if (!portfolio) {
        return httpResponse(req, res, 404, responseMessage.NOT_FOUND('Portfolios'))
      }

      httpResponse(req, res, 200, responseMessage.SUCCESS, portfolio)
    } catch (err) {
      httpError(next, err, req, 500)
    }
  },
  editPortfolio: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const { body } = req as ICreatePortfolioRequest
    
      // If a new file was uploaded, process it
      if (req.file) {
        const imageUrl = await uploadToCloudinary(req.file.path)
        body.landing_page_photo = imageUrl
      }  

      // * Body Validation
      const { error, value } = validateJoiSchema<ICreatePortfolioRequestBody>(ValidateCreatePortfolioBody, body)
      if (error) {
        return httpError(next, error, req, 422)
      }

      const portfolio = await portfolioDatabase.getPortfolioDetail(id);
      if (!portfolio) {
        return httpResponse(req, res, 404, responseMessage.NOT_FOUND('Portfolio'))
      }

      const { entity, name, summary, active, landing_page_photo } = value

      const payload: Partial<IPortfolio> = {
        entity,
        name,
        summary,
        active,
        landing_page_photo: landing_page_photo || portfolio.landing_page_photo || null
      }

      const updatedPortfolio = await portfolioDatabase.updatePortfolio(id, payload)
      if (!updatedPortfolio) {
        return httpError(next, new Error(responseMessage.NOT_FOUND('Portfolio')), req, 404)
      }

      httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'Portfolio updated successfully' })
    } catch (err) {
      httpError(next, err, req, 500)
    }
  },
  deletePortfolio: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params

      const deletedPortfolio = await portfolioDatabase.deletePortfolio(id)
      if (!deletedPortfolio) {
        return httpError(next, new Error(responseMessage.NOT_FOUND('Portfolio')), req, 404)
      }

      httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'Portfolio deleted successfully' })
    } catch (err) {
      httpError(next, err, req, 500)
    }
  }
}
