import { Request, Response } from 'express';
import { Supplier } from '../models';

export class SupplierController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const suppliers = await Supplier.find({ businessId }).sort({ outstandingBalance: -1 });
      res.json(suppliers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
