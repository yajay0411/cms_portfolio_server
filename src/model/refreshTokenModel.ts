import mongoose from 'mongoose'
import { IRefreshToken } from '../types/auth.types'
import config from '../config/config'

const refreshTokenSchema = new mongoose.Schema<IRefreshToken>(
  {
    token: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

refreshTokenSchema.index(
  {
    createdAt: -1
  },
  { expireAfterSeconds: config.API_REFRESH_TOKEN.EXPIRY }
)

export default mongoose.model<IRefreshToken>('refresh-token', refreshTokenSchema)
