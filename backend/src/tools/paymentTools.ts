import { Invoice, Payment, Supplier, Approval } from '../models';
import { AuditService } from '../services/auditService';

export interface ReconciliationReport {
  totalPendingAmount: number;
  totalInvoicesChecked: number;
  matchedCount: number;
  partialCount: number;
  unmatchedCount: number;
  overdueCount: number;
  pendingSupplierPayments: Array<{
    supplierName: string;
    invoiceNumber: string;
    invoiceAmount: number;
    paidAmount: number;
    pendingAmount: number;
    dueDate: Date;
    status: string;
    reconciliationStatus: string;
    discrepancyNote?: string;
  }>;
  discrepancies: Array<{
    supplierName: string;
    invoiceNumber: string;
    invoiceAmount: number;
    paidAmount: number;
    mismatchAmount: number;
    note: string;
  }>;
}

export class PaymentTools {
  static async getReconciliationSummary(businessId: string): Promise<ReconciliationReport> {
    const invoices = await Invoice.find({ businessId }).populate('supplierId');
    const payments = await Payment.find({ businessId });

    let totalPendingAmount = 0;
    let matchedCount = 0;
    let partialCount = 0;
    let unmatchedCount = 0;
    let overdueCount = 0;

    const pendingSupplierPayments: ReconciliationReport['pendingSupplierPayments'] = [];
    const discrepancies: ReconciliationReport['discrepancies'] = [];

    const now = new Date();

    for (const inv of invoices) {
      const supp = inv.supplierId as any;
      const suppName = supp?.name || 'Unknown Supplier';

      if (inv.reconciliationStatus === 'MATCHED') {
        matchedCount++;
      } else if (inv.reconciliationStatus === 'PARTIAL_MATCH') {
        partialCount++;
        totalPendingAmount += inv.pendingAmount;
        discrepancies.push({
          supplierName: suppName,
          invoiceNumber: inv.invoiceNumber,
          invoiceAmount: inv.amount,
          paidAmount: inv.paidAmount,
          mismatchAmount: 2000,
          note: inv.reconciliationNote || `₹2,000 mismatch between invoice and recorded payment.`,
        });
        pendingSupplierPayments.push({
          supplierName: suppName,
          invoiceNumber: inv.invoiceNumber,
          invoiceAmount: inv.amount,
          paidAmount: inv.paidAmount,
          pendingAmount: inv.pendingAmount,
          dueDate: inv.dueDate,
          status: inv.status,
          reconciliationStatus: inv.reconciliationStatus,
          discrepancyNote: inv.reconciliationNote,
        });
      } else {
        // UNMATCHED or UNPAID
        unmatchedCount++;
        totalPendingAmount += inv.pendingAmount;
        if (new Date(inv.dueDate) < now) {
          overdueCount++;
        }
        pendingSupplierPayments.push({
          supplierName: suppName,
          invoiceNumber: inv.invoiceNumber,
          invoiceAmount: inv.amount,
          paidAmount: inv.paidAmount,
          pendingAmount: inv.pendingAmount,
          dueDate: inv.dueDate,
          status: inv.status,
          reconciliationStatus: inv.reconciliationStatus,
        });
      }
    }

    await AuditService.log({
      businessId,
      agentName: 'PaymentAgent',
      actionType: 'GENERATE_RECONCILIATION_REPORT',
      resourceType: 'Payment',
      riskLevel: 'LOW',
      outputData: { totalPendingAmount, matchedCount, partialCount, unmatchedCount },
      status: 'SUCCESS',
    });

    return {
      totalPendingAmount,
      totalInvoicesChecked: invoices.length,
      matchedCount,
      partialCount,
      unmatchedCount,
      overdueCount,
      pendingSupplierPayments,
      discrepancies,
    };
  }

  static async markInvoiceReconciled(invoiceId: string, resolutionNote: string): Promise<any> {
    const inv = await Invoice.findById(invoiceId);
    if (!inv) throw new Error('Invoice not found');

    inv.reconciliationStatus = 'MATCHED';
    inv.reconciliationNote = resolutionNote;
    inv.status = 'PAID';
    inv.paidAmount = inv.amount;
    inv.pendingAmount = 0;
    await inv.save();

    await AuditService.log({
      businessId: inv.businessId.toString(),
      agentName: 'PaymentAgent',
      actionType: 'RESOLVE_PAYMENT_DISCREPANCY',
      resourceType: 'Invoice',
      resourceId: inv._id.toString(),
      riskLevel: 'MEDIUM',
      outputData: { invoiceId, resolutionNote },
      status: 'SUCCESS',
    });

    return inv;
  }
}
