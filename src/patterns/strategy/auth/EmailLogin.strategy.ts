import { UserRepository } from '@/repository/users.repository';
import { AuthBaseStrategy } from './authBase.strategy';
import { AuthResult, LoginRequest } from '@/types/auth.type';
import responseMessage from '@/constant/responseMessage';
import { verifyPassword } from '@/util/crypto';

export class EmailPasswordStrategy implements AuthBaseStrategy {
  constructor(private users: UserRepository) {}

  canHandle(payload: LoginRequest): boolean {
    return payload.provider === 'EMAIL';
  }

  async authenticate(payload: LoginRequest): Promise<Omit<AuthResult, 'accessToken' | 'refreshToken'>> {
    if (!payload.email || !payload.password) {
      throw new Error(responseMessage.BAD_REQUEST);
    }
    const user = await this.users.findOne({ email: payload.email });
    if (!user?.passwordHash) {
      throw new Error(responseMessage.NOT_FOUND('User'));
    }
    const ok = await verifyPassword(payload.password, user.passwordHash);
    if (!ok) throw new Error(responseMessage.INVALID_EMAIL_OR_PASSWORD);

    await this.users.setLoginMeta(user._id.toString());
    return { user };
  }
}
