import { Request, Response } from 'express';
import { SchemeTools } from '../tools/schemeTools';

export class SchemeController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const results = await SchemeTools.searchAndMatchSchemes(businessId);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async generateDraft(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const id = req.params.id as string;
      const app = await SchemeTools.generateApplicationDraft(businessId, id);
      res.status(201).json(app);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
