import dotenvFlow from 'dotenv-flow'

dotenvFlow.config()

export default {
  // General
  ENV: process.env.ENV as string,
  PORT: process.env.PORT as string,
  SERVER_URL: process.env.SERVER_URL as string,

  // Frontend
  CLIENT_URL: process.env.CLIENT_URL as string,

  // Email Service
  SEND_GRID_API_SECRET: process.env.SEND_GRID_API_SECRET as string,

  // Email id
  EMAIL_FROM: process.env.EMAIL_FROM as string,

  // Database
  DATABASE_URL: process.env.DATABASE_URL as string,

  // Access Token
  API_ACCESS_TOKEN: {
    SECRET: process.env.API_ACCESS_TOKEN_SECRET as string,
    EXPIRY: 3600
  },

  // Access Token
  CLIENT_ACCESS_TOKEN: {
    SECRET: process.env.CLIENT_ACCESS_TOKEN_SECRET as string,
    EXPIRY: 3600
  },

  // Refresh Token
  API_REFRESH_TOKEN: {
    SECRET: process.env.API_REFRESH_TOKEN_SECRET as string,
    EXPIRY: 3600 * 24 * 365
  },

  // CLOUDINARY
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
  CLOUDINARY_URL: process.env.CLOUDINARY_URL as string
}
