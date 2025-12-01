// import { UserRepositoryFactory } from '@/repository/userRespository/user.repository.factory';
// import { TokenFactory } from '@/patterns/factory/token.factory';
// import { AuthFactory } from '@/patterns/factory/auth.factory';
// // import { AuthService } from '@/service/auth/auth.service';
// // import { AuthFacade } from '@/patterns/facade/auth.facade';
// import { OtpRepositoryFactory } from '@/repository/otpRepository/otp.repository.factory';
// import { ConsoleSmsService } from '@/service/sms.service';
// import { GoogleOAuthService } from '@/service/auth/google_auth.service';
// import { ConsoleEmailService } from '@/service/email.service';
// import { auth } from '@/middleware/auth.middleware';

// const userRepository = UserRepositoryFactory();
// const tokenFactory = new TokenFactory();
// const otpRepository = OtpRepositoryFactory();
// const googleService = new GoogleOAuthService();
// const authFactory = new AuthFactory(userRepository, otpRepository, googleService);
// const smsService = new ConsoleSmsService();
// const emailService = new ConsoleEmailService();

// const authService = new AuthService(userRepository, tokenFactory, authFactory, otpRepository, smsService, emailService);

// export const authFacade = new AuthFacade(authService);

// export const authMiddleware = auth(tokenFactory, userRepository);
