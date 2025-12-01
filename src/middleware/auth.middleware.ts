// import { Request, Response, NextFunction } from 'express';
// import { TokenFactory } from '@/patterns/factory/token.factory';
// import { IUserRepository } from '@/repository/userRespository/user.repository.interface';
// import responseMessage from '@/constant/responseMessage';
// import { UserLike } from '@/types/auth.type';

// declare module 'express-serve-static-core' {
//   interface Request {
//     user?: UserLike & { id: string };
//   }
// }

// type AuthMiddleware = (req: Request, res: Response, next: NextFunction) => Promise<void | Response>;

// export const auth = (tokenFactory: TokenFactory, userRepository: IUserRepository): AuthMiddleware => {
//   return async (req, res, next): Promise<void | Response> => {
//     try {
//       const token = req.cookies?.accessToken;

//       if (!token) {
//         return res.status(401).json({ success: false, message: responseMessage.UNAUTHORIZED, data: null });
//       }

//       const decoded = tokenFactory.verifyAccessAndBlacklist(token);
//       const user = await userRepository.findById(decoded.sub);

//       if (!user) {
//         return res.status(401).json({ success: false, message: responseMessage.UNAUTHORIZED, data: null });
//       }

//       const safeUser = {
//         ...(user as any),
//         id: (user as any).id ?? (user as any)._id?.toString(),
//         _id: undefined,
//         password: undefined,
//         passwordHash: undefined
//       } as unknown as UserLike & { id: string };

//       req.user = safeUser;
//       return next();
//     } catch (err: unknown) {
//       const isJwtError = err && typeof err === 'object' && 'name' in err;
//       const isExpired = isJwtError && (err as any).name === 'TokenExpiredError';
//       return res.status(401).json({ success: false, message: isExpired ? responseMessage.TOKEN_EXPIRED : responseMessage.INVALID_TOKEN, data: null });
//     }
//   };
// };
