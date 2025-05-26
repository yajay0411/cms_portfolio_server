import { Router } from 'express'
import apiController from '../controller/api.controller'
import rateLimit from '../middleware/rateLimit'

const router = Router()

router.route('/self').get(rateLimit, apiController.self)
router.route('/health').get(rateLimit, apiController.health)

export default router
