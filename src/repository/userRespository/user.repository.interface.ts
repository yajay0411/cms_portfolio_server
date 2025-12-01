import { UserLike } from '@/types/auth.type';

export interface IUserRepository {
  create(data: Partial<UserLike>): Promise<UserLike>;
  findById(id: string): Promise<UserLike | null>;
  findOne(where: Record<string, unknown>): Promise<UserLike | null>;
  updateById(id: string, data: Partial<UserLike>): Promise<UserLike>;
  findOrCreateByEmail(email: string, defaults?: Partial<UserLike>): Promise<UserLike>;
  findOrCreateByMobile(mobile: string, defaults?: Partial<UserLike>): Promise<UserLike>;
  setLoginMeta(id: string): Promise<void>;
}
