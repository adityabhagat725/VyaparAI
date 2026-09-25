import { Request, Response } from 'express';
import { StaffTools } from '../tools/staffTools';

export class StaffController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const payrollSummary = await StaffTools.summarizePayroll(businessId);
      res.json(payrollSummary);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async recordAdvance(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const { name, amount, note } = req.body;

      if (!name || !amount) {
        res.status(400).json({ error: 'Name and amount are required.' });
        return;
      }

      const result = await StaffTools.recordSalaryAdvance(
        businessId,
        name,
        parseFloat(amount),
        note
      );
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const { name, phone, role, monthlySalary } = req.body;

      if (!name) {
        res.status(400).json({ error: 'Staff name is required.' });
        return;
      }

      const newStaff = await StaffTools.addStaff(businessId, {
        name,
        phone,
        role,
        monthlySalary: monthlySalary ? parseFloat(monthlySalary) : 12000,
      });

      res.status(201).json(newStaff);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async disburse(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const id = req.params.id as string;

      const result = await StaffTools.disburseSalary(businessId, id);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
