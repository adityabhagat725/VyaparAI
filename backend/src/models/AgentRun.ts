import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAgentStep {
  stepNumber: number;
  agentName: string;
  action: string;
  toolCalled?: string;
  toolInput?: Record<string, any>;
  toolOutput?: Record<string, any>;
  reasoning?: string;
  durationMs: number;
  timestamp: Date;
}

export interface IAgentRun extends Document {
  businessId: Types.ObjectId;
  orchestratorIntent: string; // e.g. INVENTORY_CHECK, ORDER_STOCK, RECONCILE_PAYMENTS, GST_STATUS, SCHEME_DISCOVERY
  triggerSource: 'USER_CHAT' | 'WHATSAPP' | 'SCHEDULED_BACKGROUND_WORKER' | 'SYSTEM_EVENT';
  status: 'STARTED' | 'IN_PROGRESS' | 'WAITING_APPROVAL' | 'COMPLETED' | 'FAILED';
  userQuery?: string;
  summaryResult?: string;
  steps: IAgentStep[];
  approvalId?: Types.ObjectId;
  durationMs?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AgentRunSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    orchestratorIntent: { type: String, required: true },
    triggerSource: {
      type: String,
      enum: ['USER_CHAT', 'WHATSAPP', 'SCHEDULED_BACKGROUND_WORKER', 'SYSTEM_EVENT'],
      default: 'USER_CHAT',
    },
    status: {
      type: String,
      enum: ['STARTED', 'IN_PROGRESS', 'WAITING_APPROVAL', 'COMPLETED', 'FAILED'],
      default: 'STARTED',
      index: true,
    },
    userQuery: { type: String },
    summaryResult: { type: String },
    steps: [
      {
        stepNumber: { type: Number, required: true },
        agentName: { type: String, required: true },
        action: { type: String, required: true },
        toolCalled: { type: String },
        toolInput: { type: Schema.Types.Mixed },
        toolOutput: { type: Schema.Types.Mixed },
        reasoning: { type: String },
        durationMs: { type: Number, default: 0 },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    approvalId: { type: Schema.Types.ObjectId, ref: 'Approval' },
    durationMs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

AgentRunSchema.index({ businessId: 1, createdAt: -1 });

export const AgentRun = mongoose.model<IAgentRun>('AgentRun', AgentRunSchema);
