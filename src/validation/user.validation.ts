import joi from 'joi'
import { IUpdateUserRequestBody } from '../types/user.types'

export const ValidateUpdateUserBody = joi.object<IUpdateUserRequestBody, true>({
  name: joi.string().min(2).max(72).trim().required(),
  phoneNumber: joi
    .object({
      isoCode: joi.string().length(2).trim().required(),
      countryCode: joi
        .string()
        .pattern(/^\+\d+$/)
        .trim()
        .required(),
      internationalNumber: joi
        .string()
        .pattern(/^\+\d{1,3}\s\d+$/)
        .trim()
        .required()
    })
    .required(),
  profile_image: joi
    .string()
    .uri({ scheme: ['https'] })
    .allow(null)
})
