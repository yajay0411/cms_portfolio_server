import mongoose from "mongoose"

export interface IPortfolio {
  entity: string
  name: string
  summary: string
  active: boolean
  landing_page_photo: string | null
  createdBy: mongoose.Types.ObjectId
}

export interface ICreatePortfolioRequestBody {
  entity: string
  name: string
  summary: string
  active?: boolean
  landing_page_photo: string
}
