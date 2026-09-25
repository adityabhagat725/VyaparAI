import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStaff extends Document {
  businessId: Types.ObjectId;
  name: string;
  phone: string;
  role: string;
  monthlySalary: number;
  advanceSalaryTaken: number;
  presentDaysThisMonth: number;
  totalWorkingDays: number;
  joiningDate: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, default: '' },
    role: { type: String, default: 'Helper' },
    monthlySalary: { type: Number, required: true, default: 12000 },
    advanceSalaryTaken: { type: Number, required: true, default: 0 },
    presentDaysThisMonth: { type: Number, required: true, default: 26 },
    totalWorkingDays: { type: Number, required: true, default: 30 },
    joiningDate: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

StaffSchema.index({ businessId: 1, name: 1 });

export const Staff = mongoose.model<IStaff>('Staff', StaffSchema);
