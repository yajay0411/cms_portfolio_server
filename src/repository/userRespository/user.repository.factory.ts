import config from '@/config/app.config';
import { PostgresUserRepository } from '../db/pg/user.repository';
import { IUserRepository } from './user.repository.interface';

export const UserRepositoryFactory = (): IUserRepository => {
  switch (config.DATABASE) {
    case 'POSTGRES':
      return new PostgresUserRepository();
    default:
      throw new Error(`Unknown DB provider: ${config.DATABASE}`);
  }
};
