import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInventory extends Document {
  businessId: Types.ObjectId;
  productId: Types.ObjectId;
  currentStock: number;
  safetyStockThreshold: number; // reorder level
  recommendedReorderQuantity: number;
  avgDailySales: number; // velocity in units/day
  stockVelocity: number; // unit movement per day
  estimatedDaysLeft: number; // stockout forecast
  stockStatus: 'HEALTHY' | 'LOW' | 'CRITICAL';
  preferredSupplierId?: Types.ObjectId;
  lastAuditedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    currentStock: { type: Number, required: true, default: 0 },
    safetyStockThreshold: { type: Number, required: true, default: 10 },
    recommendedReorderQuantity: { type: Number, required: true, default: 50 },
    avgDailySales: { type: Number, required: true, default: 2 },
    stockVelocity: { type: Number, required: true, default: 2 },
    estimatedDaysLeft: { type: Number, required: true, default: 10 },
    stockStatus: {
      type: String,
      enum: ['HEALTHY', 'LOW', 'CRITICAL'],
      default: 'HEALTHY',
      index: true,
    },
    preferredSupplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    lastAuditedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

InventorySchema.index({ businessId: 1, productId: 1 }, { unique: true });

export const Inventory = mongoose.model<IInventory>('Inventory', InventorySchema);
