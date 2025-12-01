import { AuthFactory } from '@/patterns/factory/auth.factory';
import { TokenFactory } from '@/patterns/factory/token.factory';
import { AuthResult, LoginRequest, UserLike } from '@/types/auth.type';
import { hashPassword } from '@/util/crypto';
import { ISmsService } from '@/service/sms.service';
import { IEmailService } from '@/service/email.service';
import responseMessage from '@/constant/responseMessage';
import { IUserRepository } from '@/repository/userRespository/user.repository.interface';
import { IOtpRepository } from '@/repository/otpRepository/otp.repository.interface';

export class AuthService {
  constructor(
    private users: IUserRepository,
    private tokenFactory: TokenFactory,
    private strategyFactory: AuthFactory,
    private otps: IOtpRepository,
    private sms: ISmsService,
    private emailService: IEmailService
  ) {}

  async register(data: { email?: string; password?: string; name?: string; mobile?: string }): Promise<{ user: UserLike }> {
    if (!data.email || !data.password) {
      throw new Error('Email and password required for registration.');
    }

    const existing = await this.users.findOne({ email: data.email });
    if ((existing as any)?.providers?.EMAIL) {
      throw new Error(responseMessage.ALREADY_EXIST('User', 'email'));
    }

    const passwordHash = await hashPassword(data.password);
    let user: UserLike;

    if (existing) {
      user = await this.users.updateById(((existing as any).id ?? (existing as any)._id?.toString()) as string, {
        passwordHash,
        name: data.name ?? (existing as any).name,
        mobile: data.mobile ?? (existing as any).mobile,
        providers: { ...((existing as any).providers ?? {}), EMAIL: true }
      });
    } else {
      user = await this.users.create({
        email: data.email,
        passwordHash,
        name: data.name ?? null,
        mobile: data.mobile ?? null,
        providers: { EMAIL: true }
      });
    }
    return { user };
  }

  async login(payload: LoginRequest): Promise<AuthResult> {
    const strategy = this.strategyFactory.getAll().find((s) => s.canHandle(payload));
    if (!strategy) {
      throw new Error('UNSUPPORTED_PROVIDER');
    }

    const { user } = await strategy.authenticate(payload);
    const id = ((user as any).id ?? (user as any)._id?.toString()) as string;
    const tokens = this.tokenFactory.create(id);
    return { user, ...tokens };
  }

  async loginWithOtp(contact: string): Promise<void> {
    if (!contact || typeof contact !== 'string') {
      throw new Error(responseMessage.BAD_REQUEST);
    }

    const isEmail = contact.includes('@');
    const isMobile = /^\d{10}$/.test(contact);
    if (!isEmail && !isMobile) {
      throw new Error(responseMessage.INVALID_REQUEST);
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const ttlSeconds = 5 * 60;

    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact)) {
        throw new Error(responseMessage.INVALID_EMAIL);
      }
      const existingUser = await this.users.findOne({ email: contact });
      if (!existingUser) {
        throw new Error(responseMessage.NOT_FOUND('User'));
      }
      await this.emailService.sendOtp(contact, code);
      await this.otps.createForContact(contact, code, ttlSeconds, 'email');
    } else {
      const normalized = contact.replace(/\s|\+/g, '');
      if (!/^\d{10,15}$/.test(normalized)) {
        throw new Error(responseMessage.INVALID_PHONE_NUMBER);
      }
      const existingUser = await this.users.findOne({ mobile: normalized });
      if (!existingUser) {
        throw new Error(responseMessage.NOT_FOUND('User'));
      }
      await this.otps.createForContact(normalized, code, ttlSeconds, 'mobile');
      await this.sms.sendOtp(normalized, code);
    }
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    try {
      const tokens = this.tokenFactory.rotate(refreshToken);
      const { sub: userId } = this.tokenFactory.verifyAccess(tokens.accessToken);
      const user = await this.users.findById(userId);
      if (!user) {
        throw new Error('INVALID_REFRESH');
      }
      return { user, ...tokens };
    } catch {
      throw new Error('INVALID_REFRESH');
    }
  }

  logout(accessToken: string, refreshToken: string): void {
    try {
      this.tokenFactory.blacklistToken(accessToken, 'ACCESS');
      this.tokenFactory.blacklistToken(refreshToken, 'REFRESH');
    } catch (error) {
      throw new Error((error as Error)?.message);
    }
  }
}
