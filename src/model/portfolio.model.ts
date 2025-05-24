import mongoose from 'mongoose'
import { IPortfolio } from '../types/portfolio.types'

const portfolioSchema = new mongoose.Schema<IPortfolio>(
  {
    entity: {
      type: String,
      minlength: 2,
      maxlength: 72,
      required: true
    },
    name: {
      type: String,
      minlength: 2,
      maxlength: 72,
      required: true
    },
    summary: {
      type: String,
      minlength: 2,
      maxlength: 72,
      required: true
    },
    landing_page_photo: {
      type: String,
      required: false,
      default: null
    },
    active: {
      type: Boolean,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
)

export default mongoose.model<IPortfolio>('portfolio', portfolioSchema)
