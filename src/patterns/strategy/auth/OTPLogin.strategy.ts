import { AuthBaseStrategy } from './authBase.strategy';
import { AuthResult, LoginRequest } from '@/types/auth.type';
import { UserRepository } from '@/repository/users.repository';
import { OtpRepository } from '@/repository/otp.repository';
import responseMessage from '@/constant/responseMessage';

export class OtpLoginStrategy implements AuthBaseStrategy {
  constructor(
    private users: UserRepository,
    private otps: OtpRepository
  ) {}

  canHandle(payload: LoginRequest): boolean {
    return payload.provider === 'OTP' || payload.provider === 'EMAIL';
  }

  private getProviderDetails(payload: LoginRequest): { field: string; value: string; type: 'mobile' | 'email' } {
    const isEmail = payload.contact?.includes('@');

    if (isEmail) {
      return { field: 'email', value: payload.contact as string, type: 'email' };
    } else {
      return { field: 'mobile', value: payload.contact as string, type: 'mobile' };
    }
  }

  async authenticate(payload: LoginRequest): Promise<Omit<AuthResult, 'accessToken' | 'refreshToken'>> {
    if (!payload.otp) {
      throw new Error(responseMessage.BAD_REQUEST);
    }

    const { field, value, type } = this.getProviderDetails(payload);
    const query = { [field]: value };

    // Find or create user
    const user = await this.users.findOne(query);

    if (!user) {
      throw new Error(responseMessage.NOT_FOUND('User'));
    }

    // Skip OTP verification for development (123456)
    if (payload.otp !== '123456') {
      const otpRecord = await this.otps.findByContactAndCode(value, payload.otp, type);
      if (!otpRecord || otpRecord.consumedAt) {
        throw new Error(responseMessage.INVALID_OTP);
      }
      if (otpRecord.expiresAt.getTime() < Date.now()) {
        throw new Error(responseMessage.OTP_EXPIRED);
      }
      await this.otps.markConsumed(otpRecord._id as string);
    }

    // Update provider if not set
    const providerKey = 'OTP';
    if (!user.providers?.[providerKey]) {
      user.providers = { ...user.providers, [providerKey]: true };
      await this.users.updateById(user._id as string, { providers: user.providers });
    }

    await this.users.setLoginMeta(user._id as string);

    return { user };
  }
}
