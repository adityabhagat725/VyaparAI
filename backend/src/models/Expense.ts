import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IExpense extends Document {
  businessId: Types.ObjectId;
  amount: number;
  category: string; // Transportation, Utilities, Rent, Packaging, Inventory, Salaries, Misc
  description: string;
  vendor?: string;
  expenseDate: Date;
  paymentMode: string;
  autoCategorized: boolean;
  confidenceScore?: number;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true, default: 'Misc' },
    description: { type: String, required: true },
    vendor: { type: String },
    expenseDate: { type: Date, required: true, default: Date.now },
    paymentMode: { type: String, default: 'CASH' },
    autoCategorized: { type: Boolean, default: true },
    confidenceScore: { type: Number, default: 0.95 },
    receiptUrl: { type: String },
  },
  { timestamps: true }
);

ExpenseSchema.index({ businessId: 1, expenseDate: -1 });

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);
