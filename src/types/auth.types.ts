import { JwtPayload } from "jsonwebtoken"

export interface IRefreshToken {
  token: string
}

export interface IRegisterUserRequestBody {
  name: string
  emailAddress: string
  phoneNumber: string
  password: string
  consent: boolean
  profile_image: string | null
}

export interface ILoginUserRequestBody {
  emailAddress: string
  password: string
}

export interface IDecryptedJwt extends JwtPayload {
  userId: string
}

export interface IForgotPasswordRequestBody {
  emailAddress: string
}

export interface IResetPasswordRequestBody {
  newPassword: string
}

export interface IChangePasswordRequestBody {
  oldPassword: string
  newPassword: string
  confirmNewPassword: string
}
