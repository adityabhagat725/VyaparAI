import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  businessId: Types.ObjectId;
  userId?: Types.ObjectId;
  agentName: string;
  actionType: string; // e.g. CREATE_PURCHASE_ORDER, EXECUTE_PO, RECONCILE_PAYMENT, APPROVE_ACTION
  resourceType: string; // Inventory, PurchaseOrder, Payment, Invoice, ComplianceTask, Expense
  resourceId?: Types.ObjectId;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
  status: 'SUCCESS' | 'FAILURE' | 'APPROVAL_REQUIRED' | 'PENDING';
  errorMessage?: string;
  ipAddress?: string;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    agentName: { type: String, required: true, index: true },
    actionType: { type: String, required: true, index: true },
    resourceType: { type: String, required: true },
    resourceId: { type: Schema.Types.ObjectId },
    riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
    inputData: { type: Schema.Types.Mixed },
    outputData: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'APPROVAL_REQUIRED', 'PENDING'],
      default: 'SUCCESS',
    },
    errorMessage: { type: String },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

AuditLogSchema.index({ businessId: 1, timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
