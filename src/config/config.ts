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
  EMAIL_API_KEY: process.env.EMAIL_API_KEY as string,

  // Database
  DATABASE_URL: process.env.DATABASE_URL as string,

  // Access Token
  ACCESS_TOKEN: {
    SECRET: process.env.ACCESS_TOKEN_SECRET as string,
    EXPIRY: 3600
  },

  // Refresh Token
  REFRESH_TOKEN: {
    SECRET: process.env.REFRESH_TOKEN_SECRET as string,
    EXPIRY: 3600 * 24 * 365
  }
}
