import { Router } from 'express'
import coreRoutes from './core.routes'
import authRoutes from './auth.routes'
import userRoutes from './user.routes'
import portfolioRoutes from './portfolio.routes'

const router = Router()

// Core routes
router.use('/', coreRoutes)

// Auth routes
router.use('/auth', authRoutes)

// User routes
router.use('/user', userRoutes)

// Portfolio routes
router.use('/portfolio', portfolioRoutes)

export default router
