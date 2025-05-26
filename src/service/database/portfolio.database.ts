import portfolioModel from '../../model/portfolio.model'
import { IPortfolio } from '../../types/portfolio.types'

export default {
  createPortfolio: (payload: IPortfolio) => {
    return portfolioModel.create(payload)
  },
  findByEntityId: (entityId: string) => {
    return portfolioModel.findOne({ entity: entityId }).lean()
  },
  getAllPortfolios: (query: any) => {
    return portfolioModel.find(query)
  },
  getAllPortfoliosCount: (query: any) => {
    return portfolioModel.countDocuments(query).lean()
  },
  getPortfolioDetail: (id: string) => {
    return portfolioModel.findById(id).lean()
  },
  updatePortfolio: (id: string, payload: Partial<IPortfolio>) => {
    return portfolioModel.findByIdAndUpdate(id, payload, { new: true }).lean()
  },
  deletePortfolio: (id: string) => {
    return portfolioModel.findByIdAndDelete(id).lean()
  }
}
