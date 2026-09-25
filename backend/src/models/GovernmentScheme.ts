import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEligibilityCriteria {
  minTurnover?: number;
  maxTurnover?: number;
  targetSectors: string[]; // Retail, Manufacturing, Services, Kirana, All
  targetBusinessTypes: string[];
  minYearsInBusiness?: number;
  requiresUdyamRegistration: boolean;
  requiresGST: boolean;
}

export interface IGovernmentScheme extends Document {
  name: string;
  code: string;
  ministry: string;
  sector: string;
  schemeCategory: 'CREDIT_SUBSIDY' | 'COLLATERAL_FREE_LOAN' | 'QUALITY_CERTIFICATION' | 'TECHNOLOGY_UPGRADE' | 'MARKET_DEVELOPMENT';
  benefitSummary: string;
  maxBenefitAmount: string;
  eligibilityDescription: string;
  eligibilityCriteria: IEligibilityCriteria;
  requiredDocuments: string[];
  officialPortalUrl: string;
  isDemoData: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GovernmentSchemeSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    ministry: { type: String, required: true },
    sector: { type: String, default: 'MSME' },
    schemeCategory: {
      type: String,
      enum: ['CREDIT_SUBSIDY', 'COLLATERAL_FREE_LOAN', 'QUALITY_CERTIFICATION', 'TECHNOLOGY_UPGRADE', 'MARKET_DEVELOPMENT'],
      default: 'COLLATERAL_FREE_LOAN',
    },
    benefitSummary: { type: String, required: true },
    maxBenefitAmount: { type: String, required: true },
    eligibilityDescription: { type: String, required: true },
    eligibilityCriteria: {
      minTurnover: { type: Number, default: 0 },
      maxTurnover: { type: Number, default: 50000000 },
      targetSectors: [{ type: String }],
      targetBusinessTypes: [{ type: String }],
      minYearsInBusiness: { type: Number, default: 1 },
      requiresUdyamRegistration: { type: Boolean, default: true },
      requiresGST: { type: Boolean, default: false },
    },
    requiredDocuments: [{ type: String }],
    officialPortalUrl: { type: String, required: true },
    isDemoData: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const GovernmentScheme = mongoose.model<IGovernmentScheme>('GovernmentScheme', GovernmentSchemeSchema);
