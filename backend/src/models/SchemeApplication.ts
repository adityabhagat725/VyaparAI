import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISchemeApplication extends Document {
  businessId: Types.ObjectId;
  schemeId: Types.ObjectId;
  matchScore: number; // 0 - 100 (AI Relevance Indicator)
  matchReason: string;
  status: 'DISCOVERED' | 'CHECKLIST_PREPARED' | 'DRAFT_APPLICATION_READY' | 'SUBMITTED_MANUAL';
  draftData: {
    applicantName?: string;
    enterpriseName?: string;
    udyamNumber?: string;
    proposedLoanAmount?: number;
    activityDescription?: string;
  };
  checklist: Array<{
    documentName: string;
    uploaded: boolean;
    mandatory: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const SchemeApplicationSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    schemeId: { type: Schema.Types.ObjectId, ref: 'GovernmentScheme', required: true, index: true },
    matchScore: { type: Number, required: true },
    matchReason: { type: String, required: true },
    status: {
      type: String,
      enum: ['DISCOVERED', 'CHECKLIST_PREPARED', 'DRAFT_APPLICATION_READY', 'SUBMITTED_MANUAL'],
      default: 'DISCOVERED',
    },
    draftData: {
      applicantName: { type: String },
      enterpriseName: { type: String },
      udyamNumber: { type: String },
      proposedLoanAmount: { type: Number },
      activityDescription: { type: String },
    },
    checklist: [
      {
        documentName: { type: String, required: true },
        uploaded: { type: Boolean, default: false },
        mandatory: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

SchemeApplicationSchema.index({ businessId: 1, schemeId: 1 }, { unique: true });

export const SchemeApplication = mongoose.model<ISchemeApplication>('SchemeApplication', SchemeApplicationSchema);
