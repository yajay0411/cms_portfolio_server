import app from './app'
import config from './config/config'
import { initRateLimiter } from './config/rateLimiter'
import databaseService from './service/databaseService'
import logger from './util/logger'

const server = app.listen(config.PORT)
;(async () => {
  try {
    // Database Connection
    const connection = await databaseService.connect()
    logger.info(`DATABASE_CONNECTED_SUCCESSFULLY`, {
      meta: {
        CONNECTION_NAME: connection.name
      }
    })

    initRateLimiter(connection)

    logger.info(`APPLICATION_STARTED_SUCCESSFULLY`, {
      meta: {
        PORT: config.PORT,
        SERVER_URL: config.SERVER_URL
      }
    })
  } catch (err) {
    logger.error(`APPLICATION_ERROR`, { meta: err })

    server.close((error) => {
      if (error) {
        logger.error(`APPLICATION_ERROR`, { meta: error })
      }

      process.exit(1)
    })
  }
})()
