import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISupplier extends Document {
  businessId: Types.ObjectId;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin?: string;
  address: string;
  productsSupplied: string[];
  paymentTermsDays: number;
  outstandingBalance: number;
  avgDeliveryLeadDays: number;
  upiId?: string;
  bankDetails?: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    gstin: { type: String },
    address: { type: String, default: 'Wholesale Market Yard, Pune' },
    productsSupplied: [{ type: String }],
    paymentTermsDays: { type: Number, default: 15 },
    outstandingBalance: { type: Number, default: 0 },
    avgDeliveryLeadDays: { type: Number, default: 2 },
    upiId: { type: String },
    bankDetails: {
      accountNumber: { type: String },
      ifsc: { type: String },
      bankName: { type: String },
    },
  },
  { timestamps: true }
);

SupplierSchema.index({ businessId: 1, name: 1 });

export const Supplier = mongoose.model<ISupplier>('Supplier', SupplierSchema);
