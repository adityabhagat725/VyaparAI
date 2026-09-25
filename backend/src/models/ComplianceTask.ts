import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComplianceTask extends Document {
  businessId: Types.ObjectId;
  title: string;
  category: 'GST' | 'INCOME_TAX' | 'LABOUR' | 'MUNICIPAL' | 'FSSAI';
  formType: 'GSTR-1' | 'GSTR-3B' | 'CMP-08' | 'TDS' | 'FSSAI_ANNUAL' | 'OTHER';
  period: string; // e.g. "September 2026"
  dueDate: Date;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'SUBMITTED' | 'OVERDUE';
  requiredDocuments: string[];
  missingDocuments: string[];
  preparedData: {
    totalTurnover?: number;
    taxableValue?: number;
    cgstAmount?: number;
    sgstAmount?: number;
    igstAmount?: number;
    itcEligible?: number;
    invoicesCount?: number;
    flaggedInvoicesCount?: number;
    summaryNotes?: string;
  };
  filingDisclaimer: string;
  approvedByOwner: boolean;
  submittedAt?: Date;
  acknowledgementNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComplianceTaskSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['GST', 'INCOME_TAX', 'LABOUR', 'MUNICIPAL', 'FSSAI'],
      default: 'GST',
    },
    formType: {
      type: String,
      enum: ['GSTR-1', 'GSTR-3B', 'CMP-08', 'TDS', 'FSSAI_ANNUAL', 'OTHER'],
      default: 'GSTR-3B',
    },
    period: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['UPCOMING', 'IN_PROGRESS', 'PENDING_REVIEW', 'SUBMITTED', 'OVERDUE'],
      default: 'UPCOMING',
    },
    requiredDocuments: [{ type: String }],
    missingDocuments: [{ type: String }],
    preparedData: {
      totalTurnover: { type: Number, default: 0 },
      taxableValue: { type: Number, default: 0 },
      cgstAmount: { type: Number, default: 0 },
      sgstAmount: { type: Number, default: 0 },
      igstAmount: { type: Number, default: 0 },
      itcEligible: { type: Number, default: 0 },
      invoicesCount: { type: Number, default: 0 },
      flaggedInvoicesCount: { type: Number, default: 0 },
      summaryNotes: { type: String },
    },
    filingDisclaimer: {
      type: String,
      default: 'DEMO / ASSISTANCE ONLY: AI prepares and reconciles data. Actual legal filing requires authorized taxpayer authentication.',
    },
    approvedByOwner: { type: Boolean, default: false },
    submittedAt: { type: Date },
    acknowledgementNumber: { type: String },
  },
  { timestamps: true }
);

ComplianceTaskSchema.index({ businessId: 1, dueDate: 1 });

export const ComplianceTask = mongoose.model<IComplianceTask>('ComplianceTask', ComplianceTaskSchema);
