import { IOtp, OtpModel } from '@/model/otp.model';

type ContactType = 'mobile' | 'email';

export class OtpRepository {
  async findByContactAndCode(contact: string, code: string, type: ContactType): Promise<IOtp | null> {
    return OtpModel.findOne({
      [type === 'mobile' ? 'mobile' : 'email']: contact,
      code
    })
      .lean<IOtp>()
      .exec();
  }

  async markConsumed(id: string): Promise<void> {
    return OtpModel.updateOne({ _id: id }, { $set: { consumedAt: new Date() } })
      .exec()
      .then(() => undefined);
  }

  async deleteUnconsumedByContact(contact: string, type: ContactType): Promise<void> {
    await OtpModel.deleteMany({
      [type === 'mobile' ? 'mobile' : 'email']: contact,
      consumedAt: null
    }).exec();
  }

  async createForContact(contact: string, code: string, ttlSeconds: number, type: ContactType): Promise<IOtp> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    await this.deleteUnconsumedByContact(contact, type);

    const otpData = type === 'mobile' ? { mobile: contact, code, expiresAt, type } : { email: contact, code, expiresAt, type };

    const doc = await OtpModel.create(otpData);
    return doc.toObject() as IOtp;
  }
}
