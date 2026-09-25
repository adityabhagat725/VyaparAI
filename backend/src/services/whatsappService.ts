import { Conversation, Message } from '../models';

export interface IWhatsAppButton {
  label: string;
  payload: string;
  style?: 'primary' | 'danger' | 'secondary';
}

export interface IWhatsAppMessagePayload {
  toPhone: string;
  businessId: string;
  text: string;
  buttons?: IWhatsAppButton[];
  approvalId?: string;
  agentName?: string;
}

export interface IWhatsAppService {
  sendMessage(payload: IWhatsAppMessagePayload): Promise<boolean>;
  sendApprovalPrompt(payload: IWhatsAppMessagePayload): Promise<boolean>;
}

export class WhatsAppSimulatorService implements IWhatsAppService {
  async sendMessage(payload: IWhatsAppMessagePayload): Promise<boolean> {
    try {
      let conversation = await Conversation.findOne({
        businessId: payload.businessId,
        channel: 'WHATSAPP',
      });

      if (!conversation) {
        conversation = await Conversation.create({
          businessId: payload.businessId,
          channel: 'WHATSAPP',
          participantPhone: payload.toPhone,
          lastMessageAt: new Date(),
        });
      } else {
        conversation.lastMessageAt = new Date();
        await conversation.save();
      }

      await Message.create({
        conversationId: conversation._id,
        businessId: payload.businessId,
        sender: 'AGENT',
        agentName: payload.agentName || 'VyaparAI Assistant',
        messageType: payload.buttons && payload.buttons.length > 0 ? 'ACTION_CARD' : 'TEXT',
        content: payload.text,
        metadata: {
          approvalId: payload.approvalId as any,
          actionButtons: payload.buttons?.map((b) => ({
            label: b.label,
            actionPayload: b.payload,
            style: b.style || 'primary',
          })),
        },
      });

      return true;
    } catch (err) {
      console.error('Failed to send simulator message:', err);
      return false;
    }
  }

  async sendApprovalPrompt(payload: IWhatsAppMessagePayload): Promise<boolean> {
    const buttons: IWhatsAppButton[] = [
      { label: '✅ Approve', payload: `APPROVE:${payload.approvalId}`, style: 'primary' },
      { label: '❌ Reject', payload: `REJECT:${payload.approvalId}`, style: 'danger' },
    ];
    return this.sendMessage({
      ...payload,
      buttons,
    });
  }
}

export const whatsappService: IWhatsAppService = new WhatsAppSimulatorService();
