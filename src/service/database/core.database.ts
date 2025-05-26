import mongoose from 'mongoose'
import config from '../../config/config'

export default {
  connect: async () => {
    await mongoose.connect(config.DATABASE_URL)
    return mongoose.connection
  }
}
