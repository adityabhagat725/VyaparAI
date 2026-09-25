import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  businessId: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  supplierId: Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMode: 'UPI' | 'NEFT' | 'CASH' | 'CHEQUE' | 'RTGS';
  referenceNumber: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'DISPUTED';
  reconciled: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, required: true, default: Date.now },
    paymentMode: {
      type: String,
      enum: ['UPI', 'NEFT', 'CASH', 'CHEQUE', 'RTGS'],
      default: 'UPI',
    },
    referenceNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ['COMPLETED', 'PENDING', 'FAILED', 'DISPUTED'],
      default: 'COMPLETED',
    },
    reconciled: { type: Boolean, default: false },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
