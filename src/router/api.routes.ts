import { Router } from 'express';
import coreRoutes from './core.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const r = Router();

// Core routes
r.use('/', coreRoutes);

// Auth routes
r.use('/auth', authRoutes);

// User routes
r.use('/users', userRoutes);

export default r;
