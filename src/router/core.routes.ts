import { Router } from 'express';
import apiController from '../controller/api.controller';
import rateLimit from '../middleware/rateLimit';

const r = Router();

r.route('/self').get(rateLimit, apiController.self);
r.route('/health').get(rateLimit, apiController.health);

export default r;
