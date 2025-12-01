// import { NextFunction, Request, Response } from 'express';
// import responseMessage from '@/constant/responseMessage';
// import httpResponse from '@/util/httpResponse';
// import httpError from '@/util/httpError';

// export default {
//   getUsers: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const user = req.user;
//       httpResponse(req, res, 200, responseMessage.SUCCESS, { user });
//     } catch (err) {
//       httpError(next, err, req, 500);
//     }
//   }
// };
