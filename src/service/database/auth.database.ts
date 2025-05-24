import refreshTokenModel from '../../model/refreshTokenModel'
import { IRefreshToken } from '../../types/auth.types'

export default {
  createRefreshToken: (payload: IRefreshToken) => {
    return refreshTokenModel.create(payload)
  },
  deleteRefreshToken: (token: string) => {
    return refreshTokenModel.deleteOne({ token: token })
  },
  findRefreshToken: (token: string) => {
    return refreshTokenModel.findOne({ token })
  }
}
