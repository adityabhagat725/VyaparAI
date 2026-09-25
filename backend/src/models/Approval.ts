import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IApproval extends Document {
  businessId: Types.ObjectId;
  agentName: string;
  actionType: 'CREATE_PURCHASE_ORDER' | 'DISBURSE_PAYMENT' | 'RECONCILE_PAYMENT' | 'SUBMIT_COMPLIANCE' | 'EXPENSE_WRITE_OFF';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  title: string;
  reason: string;
  amount?: number;
  dataPayload: Record<string, any>;
  proposedAction: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';
  userDecisionBy?: Types.ObjectId;
  decisionNote?: string;
  respondedAt?: Date;
  modifiedData?: Record<string, any>;
  executedAt?: Date;
  executionResult?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    agentName: { type: String, required: true },
    actionType: {
      type: String,
      enum: ['CREATE_PURCHASE_ORDER', 'DISBURSE_PAYMENT', 'RECONCILE_PAYMENT', 'SUBMIT_COMPLIANCE', 'EXPENSE_WRITE_OFF'],
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
      index: true,
    },
    title: { type: String, required: true },
    reason: { type: String, required: true },
    amount: { type: Number },
    dataPayload: { type: Schema.Types.Mixed, required: true },
    proposedAction: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'MODIFIED'],
      default: 'PENDING',
      index: true,
    },
    userDecisionBy: { type: Schema.Types.ObjectId, ref: 'User' },
    decisionNote: { type: String },
    respondedAt: { type: Date },
    modifiedData: { type: Schema.Types.Mixed },
    executedAt: { type: Date },
    executionResult: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

ApprovalSchema.index({ businessId: 1, status: 1 });

export const Approval = mongoose.model<IApproval>('Approval', ApprovalSchema);
