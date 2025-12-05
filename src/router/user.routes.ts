import { Router } from 'express';
import usersController from '@/controller/users.controller';
import rateLimit from '@/middleware/rateLimit';
import { authMiddleware } from '@/patterns/di';

const r = Router();

r.route('').get(rateLimit, authMiddleware, usersController.getUsers);

export default r;

export const userSwagger = {
  tags: [{ name: 'Users' }],
  paths: {
    '/api/v1/users': {
      get: {
        tags: ['Users'],
        summary: 'List users',
        responses: {
          200: { description: 'Users fetched successfully' },
          401: { description: 'Unauthorized' }
        }
      }
    }
  }
};
