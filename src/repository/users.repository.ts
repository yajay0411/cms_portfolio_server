import { IUser, UserModel } from '@/model/user.model';
import { UpdateQuery, QueryFilter } from 'mongoose';

export class UserRepository {
  async create(data: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(data);
    return user.save();
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).lean<IUser>().exec();
  }

  async findOne(filter: QueryFilter<IUser>): Promise<IUser | null> {
    return UserModel.findOne(filter).lean<IUser>().exec();
  }

  async updateById(id: string, update: UpdateQuery<IUser>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, update, { new: true }).lean<IUser>().exec();
  }

  async findOrCreateByEmail(email: string, defaults: Partial<IUser> = {}): Promise<IUser> {
    const existing = await UserModel.findOne({ email }).lean<IUser>().exec();
    if (existing) {
      // If user exists, merge the providers
      if (defaults.providers && existing.providers) {
        const updatedUser = await UserModel.findByIdAndUpdate(
          existing._id,
          {
            $set: {
              providers: { ...existing.providers, ...defaults.providers },
              name: existing.name || defaults.name
            }
          },
          { new: true }
        )
          .lean<IUser>()
          .exec();
        return updatedUser || existing;
      }
      return existing;
    }
    const created = new UserModel({ email, ...defaults });
    return created.save();
  }

  async setLoginMeta(userId: string, when = new Date()): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { lastLoginAt: when } }).exec();
  }

  async findOrCreateByMobile(mobile: string, defaults: Partial<IUser> = {}): Promise<IUser> {
    const existing = await UserModel.findOne({ mobile }).exec();
    if (existing) return existing;
    const created = new UserModel({ mobile, ...defaults });
    return created.save();
  }
}
