import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email?: string;
  mobile?: string;
  passwordHash?: string;
  name?: string;
  role?: string;
  providers: {
    EMAIL?: boolean;
    OTP?: boolean;
    GOOGLE?: { providerUserId: string } | boolean;
    GITHUB?: { providerUserId: string } | boolean;
  };
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      index: true,
      sparse: true,
      lowercase: true,
      trim: true
    },
    mobile: {
      type: String,
      index: true,
      sparse: true
    },
    passwordHash: { type: String },
    name: { type: String },
    role: { type: String },
    providers: {
      type: Schema.Types.Mixed,
      default: {}
    },
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

// // ✅ Explicit indexes — keep only these
// UserSchema.index({ email: 1 }, { unique: true, sparse: true });
// UserSchema.index({ mobile: 1 }, { unique: true, sparse: true });

export const UserModel = mongoose.model<IUser>('User', UserSchema);
