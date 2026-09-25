import { Request, Response } from 'express';
import { InventoryTools } from '../tools/inventoryTools';
import { PurchaseOrder, Supplier } from '../models';

export class InventoryController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const status = req.query.status as string;
      const items = await InventoryTools.getInventory(businessId, status);
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async listPurchaseOrders(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const orders = await PurchaseOrder.find({ businessId })
        .populate('supplierId')
        .sort({ createdAt: -1 });
      res.json(orders);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async triggerReorder(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const { productId, quantity, unitPrice, reason } = req.body;

      const result = await InventoryTools.createDraftPurchaseOrder({
        businessId,
        productId,
        quantity: quantity || 50,
        unitPrice: unitPrice || 50,
        reason: reason || 'Manual replenishment triggered by store manager',
      });

      res.status(201).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
