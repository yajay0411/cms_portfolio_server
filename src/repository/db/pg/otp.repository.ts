import { prisma } from '@/config/prisma';
import { IOtpRepository, ContactType, OtpLike } from '@/repository/otpRepository/otp.repository.interface';

export class PostgresOtpRepository implements IOtpRepository {
  async findByContactAndCode(contact: string, code: string, type: ContactType): Promise<OtpLike | null> {
    const where = type === 'mobile' ? { mobile: contact, code } : { email: contact, code };
    const otp = await (prisma as any).otp.findFirst({ where: where as any });
    return (otp as any) ?? null;
  }

  async markConsumed(id: string): Promise<void> {
    await (prisma as any).otp.update({ where: { id } as any, data: { consumedAt: new Date() } as any });
  }

  async deleteUnconsumedByContact(contact: string, type: ContactType): Promise<void> {
    const where = type === 'mobile' ? { mobile: contact, consumedAt: null } : { email: contact, consumedAt: null };
    await (prisma as any).otp.deleteMany({ where: where as any });
  }

  async createForContact(contact: string, code: string, ttlSeconds: number, type: ContactType): Promise<OtpLike> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    await this.deleteUnconsumedByContact(contact, type);
    const data =
      type === 'mobile' ? { mobile: contact, code, type: 'mobile' as const, expiresAt } : { email: contact, code, type: 'email' as const, expiresAt };
    const clean = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined && v !== null));
    const created = await (prisma as any).otp.create({ data: clean as any });
    return created as any;
  }
}
