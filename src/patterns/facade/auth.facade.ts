import { AuthService } from '@/service/auth/auth.service';
import { AuthResult, LoginRequest, UserLike } from '@/types/auth.type';

export class AuthFacade {
  constructor(private service: AuthService) {}

  register(input: { email?: string; password?: string; name?: string; mobile?: string }): Promise<{ user: UserLike }> {
    return this.service.register(input);
  }
  login(input: LoginRequest): Promise<AuthResult> {
    return this.service.login(input);
  }
  loginWithOtp(contact: string): Promise<void> {
    return this.service.loginWithOtp(contact);
  }
  refresh(token: string): Promise<AuthResult> {
    return this.service.refresh(token);
  }
  logout(accessToken: string, refreshToken: string): void {
    this.service.logout(accessToken, refreshToken);
  }
}
