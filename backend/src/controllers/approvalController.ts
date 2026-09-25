import { Request, Response } from 'express';
import { Approval } from '../models';
import { OrchestratorAgent } from '../agents/orchestrator';

export class ApprovalController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const status = req.query.status as string;
      const query: any = { businessId };
      if (status) query.status = status;

      const approvals = await Approval.find(query).sort({ createdAt: -1 });
      res.json(approvals);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async approve(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const id = req.params.id as string;
      const result = await OrchestratorAgent.handleApprovalAction({
        businessId,
        action: 'APPROVE',
        approvalId: id,
        userId: req.user?.userId,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async reject(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const id = req.params.id as string;
      const result = await OrchestratorAgent.handleApprovalAction({
        businessId,
        action: 'REJECT',
        approvalId: id,
        userId: req.user?.userId,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
