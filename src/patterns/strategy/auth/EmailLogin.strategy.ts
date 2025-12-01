// import { AuthBaseStrategy } from './authBase.strategy';
// import { AuthResult, LoginRequest } from '@/types/auth.type';
// import responseMessage from '@/constant/responseMessage';
// import { verifyPassword } from '@/util/crypto';
// import { IUserRepository } from '@/repository/userRespository/user.repository.interface';

// export class EmailPasswordStrategy implements AuthBaseStrategy {
//   constructor(private users: IUserRepository) {}

//   canHandle(payload: LoginRequest): boolean {
//     return payload.provider === 'EMAIL';
//   }

//   async authenticate(payload: LoginRequest): Promise<Omit<AuthResult, 'accessToken' | 'refreshToken'>> {
//     if (!payload.email || !payload.password) {
//       throw new Error(responseMessage.BAD_REQUEST);
//     }
//     const user = await this.users.findOne({ email: payload.email });
//     if (!user || !(user as any).passwordHash) {
//       throw new Error(responseMessage.NOT_FOUND('User'));
//     }
//     const ok = await verifyPassword(payload.password, (user as any).passwordHash);
//     if (!ok) throw new Error(responseMessage.INVALID_EMAIL_OR_PASSWORD);

//     await this.users.setLoginMeta(((user as any).id ?? (user as any)._id?.toString()) as string);
//     return { user };
//   }
// }
