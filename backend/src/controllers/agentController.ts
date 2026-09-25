import { Request, Response } from 'express';
import { AgentRun, AuditLog } from '../models';

export class AgentController {
  static async listActivity(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const runs = await AgentRun.find({ businessId })
        .populate('approvalId')
        .sort({ createdAt: -1 })
        .limit(30);
      res.json(runs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async listAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const logs = await AuditLog.find({ businessId })
        .populate('userId', 'name email role')
        .sort({ timestamp: -1 })
        .limit(50);
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
