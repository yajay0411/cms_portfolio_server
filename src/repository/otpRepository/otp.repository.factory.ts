import config from '@/config/app.config';
import { IOtpRepository } from './otp.repository.interface';
import { PostgresOtpRepository } from '../db/pg/otp.repository';

export function OtpRepositoryFactory(): IOtpRepository {
  switch (config.DATABASE) {
    case 'POSTGRES':
      return new PostgresOtpRepository();
    default:
      throw new Error('Unknown DB provider');
  }
}
