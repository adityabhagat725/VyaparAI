import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  businessId: Types.ObjectId;
  type: 'INVENTORY_ALERT' | 'PAYMENT_ALERT' | 'COMPLIANCE_ALERT' | 'APPROVAL_REQUEST' | 'SCHEME_MATCH';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  read: boolean;
  linkTab?: string; // inventory, payments, compliance, schemes, approvals
  relatedResourceId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    type: {
      type: String,
      enum: ['INVENTORY_ALERT', 'PAYMENT_ALERT', 'COMPLIANCE_ALERT', 'APPROVAL_REQUEST', 'SCHEME_MATCH'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'CRITICAL'],
      default: 'INFO',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    linkTab: { type: String, default: 'dashboard' },
    relatedResourceId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

NotificationSchema.index({ businessId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
