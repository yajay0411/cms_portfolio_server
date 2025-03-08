import { Router } from 'express'
import authRoutes from './auth.routes'
import coreRoutes from './core.routes'

const router = Router()

// Core routes
router.use('/', coreRoutes);

// Auth routes
router.use('/auth', authRoutes);

export default router;
