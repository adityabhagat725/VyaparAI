import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  businessId: Types.ObjectId;
  name: string;
  category: string;
  sku: string;
  hsnCode?: string;
  unit: string; // kg, L, packet, box, piece
  basePurchasePrice: number;
  sellingPrice: number;
  taxRatePercent: number; // 0, 5, 12, 18, 28
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, default: 'Groceries' },
    sku: { type: String, required: true },
    hsnCode: { type: String },
    unit: { type: String, default: 'kg' },
    basePurchasePrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    taxRatePercent: { type: Number, default: 5 },
  },
  { timestamps: true }
);

ProductSchema.index({ businessId: 1, name: 1 });
ProductSchema.index({ businessId: 1, sku: 1 }, { unique: true });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
