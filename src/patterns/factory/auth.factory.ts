import { AuthBaseStrategy } from '@/patterns/strategy/auth/authBase.strategy';
import { EmailPasswordStrategy } from '@/patterns/strategy/auth/EmailLogin.strategy';
import { OtpLoginStrategy } from '@/patterns/strategy/auth/OTPLogin.strategy';
import { GoogleStrategy } from '@/patterns/strategy/auth/GoogleLogin.strategy';
import { IUserRepository } from '@/repository/userRespository/user.repository.interface';
import { IOtpRepository } from '@/repository/otpRepository/otp.repository.interface';
import { GoogleOAuthService } from '@/service/auth/google_auth.service';

export class AuthFactory {
  private strategies: AuthBaseStrategy[];

  constructor(usersRepo: IUserRepository, otpRepo: IOtpRepository, googleService: GoogleOAuthService) {
    this.strategies = [new EmailPasswordStrategy(usersRepo), new OtpLoginStrategy(usersRepo, otpRepo), new GoogleStrategy(usersRepo, googleService)];
  }

  getAll(): AuthBaseStrategy[] {
    return this.strategies;
  }
}
