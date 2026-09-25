import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  businessId: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  isDemoUser: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ['OWNER', 'MANAGER', 'STAFF'], default: 'OWNER' },
    isDemoUser: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
