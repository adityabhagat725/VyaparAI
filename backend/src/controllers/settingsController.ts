import { Request, Response } from 'express';
import { Business } from '../models';
import { seedDatabase } from '../seed/seedData';

export class SettingsController {
  static async get(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const business = await Business.findById(businessId);
      res.json(business);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const updated = await Business.findByIdAndUpdate(businessId, req.body, { new: true });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async resetDemo(req: Request, res: Response): Promise<void> {
    try {
      await seedDatabase(true);
      res.json({ success: true, message: 'Demo data for Shree General Store has been restored to default initial state.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
