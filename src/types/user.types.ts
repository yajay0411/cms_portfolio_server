import { EUserRole } from '../constant/userConstant'

export interface IUser {
  name: string
  emailAddress: string
  phoneNumber: {
    isoCode: string
    countryCode: string
    internationalNumber: string
  }
  timezone: string
  password: string
  role: EUserRole
  accountConfirmation: {
    status: boolean
    token: string
    code: string
    timestamp: Date | null
  }
  passwordReset: {
    token: string | null
    expiry: number | null
    lastResetAt: Date | null
  }
  profile_image: string | null
  lastLoginAt: Date | null
  consent: boolean
}

export interface IUserWithId extends IUser {
  _id: string
}

export interface IUpdateUserRequestBody {
  name: string
  phoneNumber: {
    isoCode: string
    countryCode: string
    internationalNumber: string
  }
  profile_image?: string | null
}
