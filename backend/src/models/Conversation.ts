import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  businessId: Types.ObjectId;
  channel: 'WHATSAPP' | 'WEB_ASSISTANT';
  participantPhone?: string;
  lastMessageAt: Date;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    channel: {
      type: String,
      enum: ['WHATSAPP', 'WEB_ASSISTANT'],
      default: 'WHATSAPP',
    },
    participantPhone: { type: String },
    lastMessageAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
