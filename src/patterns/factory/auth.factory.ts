import { AuthBaseStrategy } from '@/patterns/strategy/auth/authBase.strategy';
import { EmailPasswordStrategy } from '@/patterns/strategy/auth/EmailLogin.strategy';
import { OtpLoginStrategy } from '@/patterns/strategy/auth/OTPLogin.strategy';
import { GoogleStrategy } from '@/patterns/strategy/auth/GoogleLogin.strategy';
import { UserRepository } from '@/repository/users.repository';
import { OtpRepository } from '@/repository/otp.repository';
import { GoogleOAuthService } from '@/service/auth/google_auth.service';

export class AuthFactory {
  private strategies: AuthBaseStrategy[];

  constructor(usersRepo: UserRepository, otpRepo: OtpRepository, googleService: GoogleOAuthService) {
    this.strategies = [new EmailPasswordStrategy(usersRepo), new OtpLoginStrategy(usersRepo, otpRepo), new GoogleStrategy(usersRepo, googleService)];
  }

  getAll(): AuthBaseStrategy[] {
    return this.strategies;
  }
}
