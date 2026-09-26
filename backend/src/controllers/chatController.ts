import { Request, Response } from 'express';
import { Conversation, Message, User, Business } from '../models';
import { OrchestratorAgent } from '../agents/orchestrator';

export class ChatController {
  static async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const channel = (req.query.channel as string) || 'WHATSAPP';

      let conversation = await Conversation.findOne({ businessId, channel });
      if (!conversation) {
        conversation = await Conversation.create({
          businessId,
          channel: channel as any,
          participantPhone: req.user?.email || 'demo_user',
          lastMessageAt: new Date(),
        });
      }

      const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
      res.json({ conversation, messages });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const { text, channel = 'WHATSAPP' } = req.body;

      if (!text || text.trim() === '') {
        res.status(400).json({ error: 'Message text cannot be empty' });
        return;
      }

      let conversation = await Conversation.findOne({ businessId, channel });
      if (!conversation) {
        conversation = await Conversation.create({
          businessId,
          channel: channel as any,
          participantPhone: req.user?.email || 'demo_user',
          lastMessageAt: new Date(),
        });
      }

      // 1. Record User Message
      const userMsg = await Message.create({
        conversationId: conversation._id,
        businessId,
        sender: 'USER',
        messageType: 'TEXT',
        content: text,
      });

      conversation.lastMessageAt = new Date();
      await conversation.save();

      // 2. Process via Central Orchestrator Agent
      const agentResponse = await OrchestratorAgent.processMessage({
        businessId,
        query: text,
        channel: channel as any,
        userId: req.user?.userId,
      });

      // 3. Record Agent Response Message
      const agentMsg = await Message.create({
        conversationId: conversation._id,
        businessId,
        sender: 'AGENT',
        agentName: agentResponse.agentName,
        messageType: agentResponse.buttons && agentResponse.buttons.length > 0 ? 'ACTION_CARD' : 'TEXT',
        content: agentResponse.text,
        metadata: {
          approvalId: agentResponse.approvalId as any,
          actionButtons: agentResponse.buttons,
          cardData: agentResponse.data,
        },
      });

      res.json({
        userMessage: userMsg,
        agentMessage: agentMsg,
        response: agentResponse,
      });
    } catch (err: any) {
      console.error('Chat error:', err);
      res.status(500).json({ error: err.message });
    }
  }

  static async whatsappWebhook(req: Request, res: Response): Promise<void> {
    // Meta Cloud API Webhook verification or incoming payload handler
    if (req.method === 'GET') {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];
      if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        res.status(200).send(challenge);
        return;
      }
      res.status(403).send('Forbidden');
      return;
    }

    // Incoming WhatsApp payload
    try {
      const body = req.body;
      if (body?.object === 'whatsapp_business_account') {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];

        if (message) {
          const fromPhone = message.from || '';
          let incomingText = '';
          if (message.type === 'text') {
            incomingText = message.text?.body || '';
          } else if (message.type === 'interactive') {
            incomingText = message.interactive?.button_reply?.id || message.interactive?.list_reply?.id || '';
          } else if (message.type === 'button') {
            incomingText = message.button?.payload || '';
          }

          if (incomingText) {
            // Find business by phone or fall back to Shree General Store
            const cleanPhone = fromPhone.replace(/\D/g, '').slice(-10);
            let business = await Business.findOne({ phone: { $regex: cleanPhone } });
            if (!business) {
              business = await Business.findOne({ name: 'Shree General Store' });
            }

            if (business) {
              const businessId = business._id.toString();

              let conversation = await Conversation.findOne({ businessId, channel: 'WHATSAPP' });
              if (!conversation) {
                conversation = await Conversation.create({
                  businessId,
                  channel: 'WHATSAPP',
                  participantPhone: fromPhone,
                  lastMessageAt: new Date(),
                });
              } else {
                conversation.lastMessageAt = new Date();
                await conversation.save();
              }

              // Store user message
              await Message.create({
                conversationId: conversation._id,
                businessId,
                sender: 'USER',
                messageType: 'TEXT',
                content: incomingText,
              });

              // Process via Orchestrator
              const agentResponse = await OrchestratorAgent.processMessage({
                businessId,
                query: incomingText,
                channel: 'WHATSAPP',
                phoneNumber: fromPhone,
              });

              // Store agent message
              await Message.create({
                conversationId: conversation._id,
                businessId,
                sender: 'AGENT',
                agentName: agentResponse.agentName,
                messageType: agentResponse.buttons && agentResponse.buttons.length > 0 ? 'ACTION_CARD' : 'TEXT',
                content: agentResponse.text,
                metadata: {
                  approvalId: agentResponse.approvalId as any,
                  actionButtons: agentResponse.buttons,
                  cardData: agentResponse.data,
                },
              });
            }
          }
        }
      }

      res.status(200).json({ status: 'received' });
    } catch (err) {
      console.error('WhatsApp webhook error:', err);
      res.status(500).send('Error');
    }
  }
}
