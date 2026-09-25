import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInvoiceItem {
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface IInvoice extends Document {
  businessId: Types.ObjectId;
  supplierId: Types.ObjectId;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  reconciliationStatus: 'MATCHED' | 'PARTIAL_MATCH' | 'UNMATCHED' | 'DISPUTED';
  reconciliationNote?: string;
  items: IInvoiceItem[];
  gstAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
    invoiceNumber: { type: String, required: true },
    invoiceDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'],
      default: 'UNPAID',
      index: true,
    },
    reconciliationStatus: {
      type: String,
      enum: ['MATCHED', 'PARTIAL_MATCH', 'UNMATCHED', 'DISPUTED'],
      default: 'UNMATCHED',
    },
    reconciliationNote: { type: String },
    items: [
      {
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, default: 'kg' },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
      },
    ],
    gstAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

InvoiceSchema.index({ businessId: 1, invoiceNumber: 1 });

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
