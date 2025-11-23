import mongoose, { Schema, Document } from 'mongoose';

export type ContactType = 'email' | 'mobile';

export interface IOtp extends Document {
  email?: string;
  mobile?: string;
  code: string;
  type: ContactType;
  expiresAt: Date;
  consumedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      index: true,
      trim: true,
      lowercase: true,
      sparse: true
    },
    mobile: {
      type: String,
      index: true,
      trim: true,
      sparse: true
    },
    code: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['email', 'mobile']
    },
    expiresAt: {
      type: Date,
      required: true
    },
    consumedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: function (
        this: mongoose.Document,
        doc: mongoose.Document,
        ret: Record<string, unknown> & { _id: unknown; __v: unknown }
      ): Record<string, unknown> {
        // Create a new object without _id and __v
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, __v, ...result } = ret;
        return result;
      }
    }
  }
);

// Add compound indexes for faster lookups
OtpSchema.index({ email: 1, code: 1 }, { unique: true, partialFilterExpression: { email: { $exists: true } } });
OtpSchema.index({ mobile: 1, code: 1 }, { unique: true, partialFilterExpression: { mobile: { $exists: true } } });
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Add a compound index for the contact field based on type
OtpSchema.index(
  { type: 1 },
  {
    partialFilterExpression: {
      $or: [{ email: { $exists: true } }, { mobile: { $exists: true } }]
    }
  }
);

export const OtpModel = mongoose.model<IOtp>('Otp', OtpSchema);
