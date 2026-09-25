import { Request, Response } from 'express';
import { ComplianceTools } from '../tools/complianceTools';
import { ComplianceTask } from '../models';

export class ComplianceController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const tasks = await ComplianceTools.getUpcomingDeadlines(businessId);
      res.json(tasks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async prepareDraft(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const updated = await ComplianceTools.prepareComplianceDraft(id);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async authorizeFiling(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const task = await ComplianceTask.findById(id);
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      task.approvedByOwner = true;
      task.status = 'SUBMITTED';
      task.submittedAt = new Date();
      task.acknowledgementNumber = `ACK-GST-${Date.now().toString().slice(-8)}`;
      await task.save();

      res.json(task);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
