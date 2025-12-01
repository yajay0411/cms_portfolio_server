// import responseMessage from '@/constant/responseMessage';
// import httpError from '@/util/httpError';
// import httpResponse from '@/util/httpResponse';
// import { NextFunction, Request, Response } from 'express';
// import { authFacade } from '@/patterns/di';
// import config from '@/config/app.config';

// export default {
//   register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const result = await authFacade.register(req.body);
//       const { user } = result;
//       httpResponse(req, res, 200, responseMessage.SUCCESS, { user });
//     } catch (err) {
//       httpError(next, err, req, 500);
//     }
//   },
//   login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const result = await authFacade.login(req.body);
//       const { user, accessToken, refreshToken } = result;
//       res.cookie('accessToken', accessToken, {
//         httpOnly: true,
//         secure: true,
//         sameSite: 'strict',
//         maxAge: 1 * 60 * 1000
//       });
//       res.cookie('refreshToken', refreshToken, {
//         httpOnly: true,
//         secure: true,
//         sameSite: 'strict',
//         maxAge: 5 * 60 * 1000 // 5 minutes
//       });
//       httpResponse(req, res, 200, responseMessage.SUCCESS, { user });
//     } catch (err) {
//       httpError(next, err, req, 500);
//     }
//   },
//   loginRequestOtp: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const { contact } = req.body || {};
//       await authFacade.loginWithOtp(contact);
//       httpResponse(req, res, 200, responseMessage.SUCCESS, { ok: true });
//     } catch (err) {
//       httpError(next, err, req, 500);
//     }
//   },
//   refresh: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const refreshToken = req.cookies?.refreshToken;
//       if (!refreshToken) {
//         return httpError(next, responseMessage.BAD_REQUEST, req, 400);
//       }

//       const result = await authFacade.refresh(refreshToken);
//       const { user, accessToken, refreshToken: newRefreshToken } = result;

//       res.cookie('accessToken', accessToken, {
//         httpOnly: true,
//         secure: config.ENV === 'production',
//         sameSite: 'strict',
//         maxAge: 1 * 60 * 1000 // 15 minutes
//       });

//       res.cookie('refreshToken', newRefreshToken, {
//         httpOnly: true,
//         secure: config.ENV === 'production',
//         sameSite: 'strict',
//         maxAge: 5 * 60 * 1000 // 5 minutes
//       });
//       httpResponse(req, res, 200, responseMessage.SUCCESS, user);
//     } catch (err) {
//       httpError(next, err, req, 500);
//     }
//   },
//   logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const accessToken = req.cookies?.accessToken;
//       const refreshToken = req.cookies?.refreshToken;
//       const result = await authFacade.logout(accessToken, refreshToken);

//       res.clearCookie('accessToken', {
//         httpOnly: true,
//         secure: config.ENV === 'production',
//         sameSite: 'strict'
//       });
//       res.clearCookie('refreshToken', {
//         httpOnly: true,
//         secure: config.ENV === 'production',
//         sameSite: 'strict'
//       });

//       httpResponse(req, res, 200, responseMessage.SUCCESS, result);
//     } catch (err) {
//       httpError(next, err, req, 500);
//     }
//   }
// };
