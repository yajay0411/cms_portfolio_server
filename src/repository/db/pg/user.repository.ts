import { prisma } from '@/config/prisma';
import { IUserRepository } from '@/repository/userRespository/user.repository.interface';
import { UserLike } from '@/types/auth.type';

export class PostgresUserRepository implements IUserRepository {
  async create(data: Partial<UserLike>): Promise<UserLike> {
    const clean = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined && v !== null));
    const user = await prisma.user.create({ data: clean as any });
    return user as any;
  }

  async findById(id: string): Promise<UserLike | null> {
    const user = await prisma.user.findUnique({ where: { id } as any });
    return (user as any) ?? null;
  }

  async findOne(where: Record<string, unknown>): Promise<UserLike | null> {
    const w = where || {};
    const entries = Object.entries(w).filter(([_, v]) => v !== undefined && v !== null && v !== '');
    const clean = Object.fromEntries(entries);
    try {
      if (typeof (clean as any).email === 'string') {
        const user = await prisma.user.findUnique({ where: { email: (clean as any).email as string } as any });
        return (user as any) ?? null;
      }
      if (typeof (clean as any).mobile === 'string') {
        const user = await prisma.user.findUnique({ where: { mobile: (clean as any).mobile as string } as any });
        return (user as any) ?? null;
      }
      if (typeof (clean as any).id === 'string') {
        const user = await prisma.user.findUnique({ where: { id: (clean as any).id as string } as any });
        return (user as any) ?? null;
      }
      if (Object.keys(clean).length === 0) return null;
      const user = await prisma.user.findFirst({ where: clean as any });
      return (user as any) ?? null;
    } catch {
      return null;
    }
  }

  async updateById(id: string, data: Partial<UserLike>): Promise<UserLike> {
    const clean = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
    const user = await prisma.user.update({ where: { id } as any, data: clean as any });
    return user as any;
  }

  async findOrCreateByEmail(email: string, defaults?: Partial<UserLike>): Promise<UserLike> {
    const existing = await prisma.user.findUnique({ where: { email } as any });
    if (existing) return existing as any;
    const created = await prisma.user.create({ data: { email, ...(defaults as any) } as any });
    return created as any;
  }

  async findOrCreateByMobile(mobile: string, defaults?: Partial<UserLike>): Promise<UserLike> {
    const existing = await prisma.user.findUnique({ where: { mobile } as any });
    if (existing) return existing as any;
    const created = await prisma.user.create({ data: { mobile, ...(defaults as any) } as any });
    return created as any;
  }

  async setLoginMeta(id: string): Promise<void> {
    await prisma.user.update({ where: { id } as any, data: { lastLoginAt: new Date() } as any });
  }
}
