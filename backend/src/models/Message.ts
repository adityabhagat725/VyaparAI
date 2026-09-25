import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  businessId: Types.ObjectId;
  sender: 'USER' | 'AGENT' | 'SYSTEM';
  agentName?: string; // Orchestrator, InventoryAgent, PaymentAgent, etc.
  messageType: 'TEXT' | 'ACTION_CARD' | 'APPROVAL_CARD' | 'QUICK_REPLY';
  content: string;
  metadata?: {
    approvalId?: Types.ObjectId;
    actionButtons?: Array<{
      label: string;
      actionPayload: string;
      style?: 'primary' | 'danger' | 'secondary';
    }>;
    agentRunId?: Types.ObjectId;
    cardData?: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    sender: { type: String, enum: ['USER', 'AGENT', 'SYSTEM'], required: true },
    agentName: { type: String, default: 'VyaparAI' },
    messageType: {
      type: String,
      enum: ['TEXT', 'ACTION_CARD', 'APPROVAL_CARD', 'QUICK_REPLY'],
      default: 'TEXT',
    },
    content: { type: String, required: true },
    metadata: {
      approvalId: { type: Schema.Types.ObjectId, ref: 'Approval' },
      actionButtons: [
        {
          label: { type: String },
          actionPayload: { type: String },
          style: { type: String, default: 'primary' },
        },
      ],
      agentRunId: { type: Schema.Types.ObjectId, ref: 'AgentRun' },
      cardData: { type: Schema.Types.Mixed },
    },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
