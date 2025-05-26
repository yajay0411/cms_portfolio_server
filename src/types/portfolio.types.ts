import mongoose from 'mongoose'

export interface IPortfolio {
  entity: string
  name: string
  summary: string
  active: boolean
  landing_page_photo: string | null
  createdBy: mongoose.Types.ObjectId
}

export interface IPortfolioQuery {
  name?: { $regex: string; $options: string }
  status?: string
  createdBy?: string
}

export interface ICreatePortfolioRequestBody {
  entity: string
  name: string
  summary: string
  active?: boolean
  landing_page_photo: string
}
