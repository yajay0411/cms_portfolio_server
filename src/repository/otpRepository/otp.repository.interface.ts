export type ContactType = 'mobile' | 'email';

export interface OtpLike {
  id?: string;
  email?: string | null;
  mobile?: string | null;
  code: string;
  type: ContactType;
  expiresAt: Date;
  consumedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOtpRepository {
  findByContactAndCode(contact: string, code: string, type: ContactType): Promise<OtpLike | null>;
  markConsumed(id: string): Promise<void>;
  deleteUnconsumedByContact(contact: string, type: ContactType): Promise<void>;
  createForContact(contact: string, code: string, ttlSeconds: number, type: ContactType): Promise<OtpLike>;
}
