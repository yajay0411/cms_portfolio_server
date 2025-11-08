import { Router } from 'express';
import coreRoutes from './core.routes';

const r = Router();

// Core routes
r.use('/', coreRoutes);

export default r;
