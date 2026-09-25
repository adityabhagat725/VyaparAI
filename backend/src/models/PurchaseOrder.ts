import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPurchaseOrderItem {
  productId: Types.ObjectId;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface IPurchaseOrder extends Document {
  businessId: Types.ObjectId;
  supplierId: Types.ObjectId;
  orderNumber: string;
  items: IPurchaseOrderItem[];
  totalAmount: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'EXECUTED_SIMULATED' | 'REJECTED' | 'DELIVERED';
  triggerReason: string;
  approvalId?: Types.ObjectId;
  executionResponse?: string;
  deliveryExpectedDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
    orderNumber: { type: String, required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, default: 'kg' },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'EXECUTED_SIMULATED', 'REJECTED', 'DELIVERED'],
      default: 'PENDING_APPROVAL',
      index: true,
    },
    triggerReason: { type: String, default: 'Predicted stockout by InventoryAgent' },
    approvalId: { type: Schema.Types.ObjectId, ref: 'Approval' },
    executionResponse: { type: String },
    deliveryExpectedDate: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

PurchaseOrderSchema.index({ businessId: 1, orderNumber: 1 });

export const PurchaseOrder = mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);
