export interface IEmailService {
  sendOtp(email: string, code: string): Promise<void>;
}

export class ConsoleEmailService implements IEmailService {
  async sendOtp(email: string, code: string): Promise<void> {
    // In a real app, you would send an email here
    // For now, we'll just log it to console
    // eslint-disable-next-line no-console
    console.log(`[Email] Sending OTP ${code} to ${email}`);
  }
}
