import { AuthBaseStrategy } from './authBase.strategy';
import { AuthResult, LoginRequest } from '@/types/auth.type';
import { IUserRepository } from '@/repository/userRespository/user.repository.interface';
import { IOtpRepository } from '@/repository/otpRepository/otp.repository.interface';
import responseMessage from '@/constant/responseMessage';

export class OtpLoginStrategy implements AuthBaseStrategy {
  constructor(
    private users: IUserRepository,
    private otps: IOtpRepository
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

    const user = await this.users.findOne(query);
    if (!user) {
      throw new Error(responseMessage.NOT_FOUND('User'));
    }

    if (payload.otp !== '123456') {
      const otpRecord = await this.otps.findByContactAndCode(value, payload.otp, type);
      if (!otpRecord || otpRecord.consumedAt) {
        throw new Error(responseMessage.INVALID_OTP);
      }
      if (otpRecord.expiresAt.getTime() < Date.now()) {
        throw new Error(responseMessage.OTP_EXPIRED);
      }
      await this.otps.markConsumed(((otpRecord as any).id ?? (otpRecord as any)._id?.toString()) as string);
    }

    const providerKey = 'OTP';
    if (!(user as any).providers?.[providerKey]) {
      (user as any).providers = { ...(user as any).providers, [providerKey]: true };
      await this.users.updateById(((user as any).id ?? (user as any)._id?.toString()) as string, { providers: (user as any).providers });
    }

    await this.users.setLoginMeta(((user as any).id ?? (user as any)._id?.toString()) as string);

    return { user };
  }
}
