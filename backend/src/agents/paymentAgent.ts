import { PaymentTools } from '../tools/paymentTools';
import { AgentRunService } from '../services/agentRunService';
import { AgentResponse } from './inventoryAgent';

export class PaymentAgent {
  static async handle(params: {
    businessId: string;
    query: string;
    runId: string;
    phoneNumber?: string;
  }): Promise<AgentResponse> {
    const { businessId, query, runId } = params;

    const startTime = Date.now();
    await AgentRunService.addStep(runId, {
      agentName: 'PaymentReconciliationAgent',
      action: 'TOOL: getReconciliationSummary',
      toolCalled: 'getReconciliationSummary',
      reasoning: 'Reconciling all supplier invoices and payment vouchers to detect pending dues, partial payments, and mismatches.',
      durationMs: Date.now() - startTime,
    });

    const report = await PaymentTools.getReconciliationSummary(businessId);

    // Group pending amounts by supplier
    const supplierTotals = new Map<string, number>();
    for (const p of report.pendingSupplierPayments) {
      const current = supplierTotals.get(p.supplierName) || 0;
      supplierTotals.set(p.supplierName, current + p.pendingAmount);
    }

    const supplierLines: string[] = [];
    supplierTotals.forEach((amt, name) => {
      supplierLines.push(`• *${name}* — ₹${amt.toLocaleString('en-IN')}`);
    });

    let messageText = `📋 *Supplier Payment Status:*\n\n` +
      `Pending payments detected for *${supplierTotals.size} suppliers*:\n\n` +
      supplierLines.join('\n') +
      `\n\n*Total Pending: ₹${report.totalPendingAmount.toLocaleString('en-IN')}*\n` +
      `Matched Transactions: ${report.matchedCount} | Unmatched: ${report.unmatchedCount}`;

    if (report.discrepancies.length > 0) {
      const disc = report.discrepancies[0];
      messageText += `\n\n⚠️ *Discrepancy Detected:* I found a *₹${disc.mismatchAmount.toLocaleString('en-IN')} mismatch* on ${disc.supplierName} (Invoice #${disc.invoiceNumber}). ${disc.note}`;
    }

    await AgentRunService.completeRun(runId, `Reconciliation complete. Total pending: ₹${report.totalPendingAmount}. Detected ${report.discrepancies.length} discrepancy.`);

    return {
      agentName: 'PaymentReconciliationAgent',
      text: messageText,
      data: report,
      buttons: [
        { label: '🔍 View Invoices', payload: 'VIEW_INVOICES', style: 'secondary' },
        { label: '💳 Prepare Payment', payload: 'PREPARE_PAYMENT', style: 'primary' },
      ],
    };
  }
}
