export interface ISmsService {
  sendOtp(mobile: string, code: string): Promise<void>;
}

export class ConsoleSmsService implements ISmsService {
  async sendOtp(mobile: string, code: string): Promise<void> {
    // Replace with real SMS provider (e.g., Twilio) integration
    // Keep as a stub for now to avoid external side effects
    // eslint-disable-next-line no-console
    console.log(`[SMS] Sending OTP ${code} to ${mobile}`);
  }
}
