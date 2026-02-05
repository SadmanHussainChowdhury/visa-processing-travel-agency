import mongoose from 'mongoose';

export interface IUser {
  _id: string;
  email: string;
  name: string;
  password?: string;
  role: 'consultant' | 'admin' | 'staff';
  image?: string;
  phone?: string;
  smsOtpHash?: string;
  smsOtpExpiresAt?: Date;
  smsOtpRequestedAt?: Date;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ['consultant', 'admin', 'staff'],
      default: 'consultant',
    },
    image: {
      type: String,
    },
    phone: {
      type: String,
      trim: true,
    },
    smsOtpHash: {
      type: String,
    },
    smsOtpExpiresAt: {
      type: Date,
    },
    smsOtpRequestedAt: {
      type: Date,
    },
    emailVerified: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple model initialization in development
export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
