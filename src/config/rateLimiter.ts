import { Connection } from 'mongoose'
import { RateLimiterMongo } from 'rate-limiter-flexible'
import logger from '../util/logger'

export let rateLimiterMongo: RateLimiterMongo | null = null

const DURATION = 60
const POINTS = 10

export const initRateLimiter = (mongooseConnection: Connection) => {
  try {
    rateLimiterMongo = new RateLimiterMongo({
      storeClient: mongooseConnection,
      points: POINTS,
      duration: DURATION
    })

    logger.info(`RATE_LIMITER_INITIATED_SUCCESSFULLY`)
  } catch (error) {
    logger.info(`RATE_LIMITER_INITIATED_FAILED`, error)
    rateLimiterMongo = null
  }
}
