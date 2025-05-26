import joi from 'joi'
import { ICreatePortfolioRequestBody } from '../types/portfolio.types'

export const ValidateCreatePortfolioBody = joi.object<ICreatePortfolioRequestBody, true>({
  entity: joi.string().min(2).max(72).trim().required(),
  name: joi.string().min(2).max(72).trim().required(),
  summary: joi.string().min(2).max(72).trim().required(),
  active: joi.boolean(),
  landing_page_photo: joi
    .string()
    .uri({ scheme: ['https'] })
    .allow(null)
})
