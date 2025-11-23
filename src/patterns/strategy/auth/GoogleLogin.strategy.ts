import { AuthBaseStrategy } from './authBase.strategy';
import { AuthResult, LoginRequest } from '@/types/auth.type';
import responseMessage from '@/constant/responseMessage';
import { UserRepository } from '@/repository/users.repository';
import { GoogleOAuthService } from '@/service/auth/google_auth.service';

export class GoogleStrategy implements AuthBaseStrategy {
  constructor(
    private users: UserRepository,
    private google: GoogleOAuthService
  ) {}

  canHandle(payload: LoginRequest): boolean {
    return payload.provider === 'GOOGLE';
  }

  async authenticate(payload: LoginRequest): Promise<Omit<AuthResult, 'accessToken' | 'refreshToken'>> {
    if (!payload.credential) {
      throw new Error(responseMessage.BAD_REQUEST);
    }

    const profile = await this.google.verifyIdToken(payload.credential);
    if (!profile.email) {
      throw new Error(responseMessage.INVALID_REQUEST);
    }

    const defaults = {
      name: profile.name ?? undefined,
      providers: { GOOGLE: { providerUserId: profile.id } }
    } as const;

    const user = await this.users.findOrCreateByEmail(profile.email, defaults);

    return { user };
  }
}
