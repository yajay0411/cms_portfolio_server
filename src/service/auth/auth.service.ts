import { AuthFactory } from '@/patterns/factory/auth.factory';
import { TokenFactory } from '@/patterns/factory/token.factory';
import { UserRepository } from '@/repository/users.repository';
import { AuthResult, LoginRequest, RegisterRequest } from '@/types/auth.type';
import { hashPassword } from '@/util/crypto';
import { OtpRepository } from '@/repository/otp.repository';
import { ISmsService } from '@/service/sms.service';
import { IEmailService } from '@/service/email.service';
import { IUser } from '@/model/user.model';
import responseMessage from '@/constant/responseMessage';

export class AuthService {
  constructor(
    private users: UserRepository,
    private tokenFactory: TokenFactory,
    private strategyFactory: AuthFactory,
    private otps: OtpRepository,
    private sms: ISmsService,
    private emailService: IEmailService
  ) {}

  async register(data: RegisterRequest): Promise<{ user: IUser }> {
    if (!data.email || !data.password) {
      throw new Error('Email and password required for registration.');
    }

    const existing = await this.users.findOne({ email: data.email });

    // If user exists and already has EMAIL provider, throw error
    if (existing?.providers?.EMAIL) {
      throw new Error('Email already in use.');
    }

    const passwordHash = await hashPassword(data.password);
    let user: IUser;

    if (existing) {
      // Update existing user (who likely signed up via OAuth)
      user = (await this.users.updateById(existing._id.toString(), {
        passwordHash,
        name: data.name || existing.name,
        mobile: data.mobile || existing.mobile,
        $set: { 'providers.EMAIL': true }
      })) as IUser;
    } else {
      // Create new user
      user = await this.users.create({
        email: data.email,
        passwordHash,
        name: data.name,
        mobile: data.mobile,
        role: 'USER',
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
    const tokens = this.tokenFactory.create(user._id.toString());
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
    const ttlSeconds = 5 * 60; // 5 minutes

    if (isEmail) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact)) {
        throw new Error(responseMessage.INVALID_EMAIL);
      }

      // check wheter user contact exist
      const existingUser = await this.users.findOne({ email: contact });
      if (!existingUser) {
        throw new Error(responseMessage.NOT_FOUND('User'));
      }

      // Send OTP via email
      await this.emailService.sendOtp(contact, code);

      // Store the OTP in the database
      await this.otps.createForContact(contact, code, ttlSeconds, 'email');
    } else {
      // Mobile number validation and normalization
      const normalized = contact.replace(/\s|\+/g, '');
      if (!/^\d{10,15}$/.test(normalized)) {
        throw new Error(responseMessage.INVALID_PHONE_NUMBER);
      }

      // check wheter user contact exist
      const existingUser = await this.users.findOne({ mobile: normalized });
      if (!existingUser) {
        throw new Error(responseMessage.NOT_FOUND('User'));
      }

      // Store the OTP and send SMS
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
      this.tokenFactory.blacklistToken(accessToken);
      this.tokenFactory.blacklistToken(refreshToken);
    } catch {
      throw new Error('INVALID_REFRESH');
    }
  }
}
