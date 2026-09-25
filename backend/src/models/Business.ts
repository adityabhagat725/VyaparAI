import mongoose, { Schema, Document } from 'mongoose';

export interface IBusiness extends Document {
  name: string;
  businessType: string; // Kirana, Retail, Wholesale, Manufacturing, Restaurant
  gstin?: string;
  pan?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  annualTurnover?: number;
  employeeCount?: number;
  settings: {
    autoApproveLowRisk: boolean;
    stockoutRiskThresholdDays: number;
    gstAlertDaysPrior: number;
    overduePaymentGraceDays: number;
    whatsappNotificationsEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    businessType: { type: String, required: true, default: 'Kirana' },
    gstin: { type: String },
    pan: { type: String },
    address: { type: String, default: 'Shop No. 4, Main Market' },
    city: { type: String, default: 'Pune' },
    state: { type: String, default: 'Maharashtra' },
    pincode: { type: String, default: '411001' },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    annualTurnover: { type: Number, default: 3500000 },
    employeeCount: { type: Number, default: 3 },
    settings: {
      autoApproveLowRisk: { type: Boolean, default: true },
      stockoutRiskThresholdDays: { type: Number, default: 4 },
      gstAlertDaysPrior: { type: Number, default: 7 },
      overduePaymentGraceDays: { type: Number, default: 3 },
      whatsappNotificationsEnabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const Business = mongoose.model<IBusiness>('Business', BusinessSchema);
