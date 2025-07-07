import userModel from '../../model/userModel'
import { IUser } from '../../types/user.types'

export default {
  findUserByEmailAddress: (emailAddress: string, select: string = '') => {
    return userModel
      .findOne({
        emailAddress
      })
      .select(select)
  },
  registerUser: (payload: IUser) => {
    return userModel.create(payload)
  },
  findUserById: (id: string, select: string = '') => {
    return userModel.findById(id).select(select)
  },
  findUserByConfirmationTokenAndCode: (token: string, code: string) => {
    return userModel.findOne({
      'accountConfirmation.token': token,
      'accountConfirmation.code': code
    })
  },
  findUserByResetToken: (token: string) => {
    return userModel.findOne({
      'passwordReset.token': token
    })
  },
  getAllUsersCount: (query: any) => {
    return userModel.countDocuments(query).lean()
  },
  getAllUsers: (query: any) => {
    return userModel.find(query).lean()
  },
  updateUser: (id: string, payload: Partial<any>) => {
    return userModel.findByIdAndUpdate(id, payload, { new: true }).lean()
  },
  deleteUser: (id: string) => {
    return userModel.findByIdAndDelete(id).lean()
  },
  findUserByGoogleId: (google_id: string) => {
    return userModel.findOne({ google_id })
  }
}
