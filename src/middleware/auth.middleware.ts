import { Request, Response, NextFunction } from 'express';
import { TokenFactory } from '@/patterns/factory/token.factory';
import { UserRepository } from '@/repository/users.repository';
import responseMessage from '@/constant/responseMessage';
import { IUser } from '@/model/user.model';

// Extend Express Request for user
declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser & { id: string };
  }
}

type AuthMiddleware = (req: Request, res: Response, next: NextFunction) => Promise<void | Response>;

export const auth = (tokenFactory: TokenFactory, userRepository: UserRepository): AuthMiddleware => {
  return async (req, res, next): Promise<void | Response> => {
    try {
      const token = req.cookies?.accessToken;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: responseMessage.UNAUTHORIZED,
          data: null
        });
      }

      // Verify token and check blacklist
      const decoded = tokenFactory.verifyAccessAndBlacklist(token);

      console.log(decoded);

      // Fetch user
      const user = await userRepository.findById(decoded.sub);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: responseMessage.UNAUTHORIZED,
          data: null
        });
      }

      // Strip sensitive fields (best practice)
      const safeUser = {
        ...user,
        id: user._id?.toString(), // Handle potential undefined _id
        _id: undefined, // Optionally remove _id if you don't want it
        password: undefined,
        passwordHash: undefined // Also remove passwordHash as it's sensitive
      } as unknown as IUser & { id: string };

      req.user = safeUser;
      return next();
    } catch (err: unknown) {
      // Check if it's a JWT error
      const isJwtError = err && typeof err === 'object' && 'name' in err;
      const isExpired = isJwtError && err.name === 'TokenExpiredError';

      return res.status(401).json({
        success: false,
        message: isExpired ? responseMessage.TOKEN_EXPIRED : responseMessage.INVALID_TOKEN,
        data: null
      });
    }
  };
};
