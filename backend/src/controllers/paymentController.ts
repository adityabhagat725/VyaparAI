import { Request, Response } from 'express';
import { PaymentTools } from '../tools/paymentTools';
import { Invoice, Payment } from '../models';

export class PaymentController {
  static async getReconciliation(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const report = await PaymentTools.getReconciliationSummary(businessId);
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async listInvoices(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const invoices = await Invoice.find({ businessId })
        .populate('supplierId')
        .sort({ dueDate: 1 });
      res.json(invoices);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async listPayments(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId!;
      const payments = await Payment.find({ businessId })
        .populate('supplierId')
        .sort({ paymentDate: -1 });
      res.json(payments);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async reconcileInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { invoiceId, resolutionNote } = req.body;
      const inv = await PaymentTools.markInvoiceReconciled(invoiceId, resolutionNote || 'Reconciled by store owner');
      res.json(inv);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
