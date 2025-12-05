import { Router } from 'express';
import authController from '../controller/auth.controller';
import rateLimit from '../middleware/rateLimit';

const r = Router();

r.route('/register').post(rateLimit, authController.register);
r.route('/login').post(rateLimit, authController.login);
r.route('/login/request-otp').post(rateLimit, authController.loginRequestOtp);
r.route('/refresh-token').get(rateLimit, authController.refresh);
r.route('/logout').post(rateLimit, authController.logout);

export default r;

export const authSwagger = {
  tags: [{ name: 'Auth' }],
  paths: {
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register with email/password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                  name: { type: 'string' },
                  mobile: { type: 'string' }
                },
                required: ['email', 'password']
              }
            }
          }
        },
        responses: {
          200: { description: 'Registered successfully' },
          400: { description: 'Bad request' }
        }
      }
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with provider',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  provider: { type: 'string', enum: ['EMAIL', 'OTP', 'GOOGLE'] },
                  email: { type: 'string' },
                  password: { type: 'string' },
                  contact: { type: 'string' },
                  otp: { type: 'string' },
                  credential: { type: 'string' }
                },
                required: ['provider']
              }
            }
          }
        },
        responses: {
          200: { description: 'Login success' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/v1/auth/login/request-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Request OTP for email/mobile',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { contact: { type: 'string' } },
                required: ['contact']
              }
            }
          }
        },
        responses: { 200: { description: 'OTP requested' } }
      }
    },
    '/api/v1/auth/refresh-token': {
      get: {
        tags: ['Auth'],
        summary: 'Refresh token',
        responses: { 200: { description: 'Token refreshed' }, 401: { description: 'Unauthorized' } }
      }
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout',
        responses: { 200: { description: 'Logged out' } }
      }
    }
  }
};
