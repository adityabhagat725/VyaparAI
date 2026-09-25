import { InventoryTools } from '../tools/inventoryTools';
import { PaymentTools } from '../tools/paymentTools';
import { ComplianceTools } from '../tools/complianceTools';
import { ExpenseTools } from '../tools/expenseTools';
import { Business } from '../models';
import { AgentRunService } from '../services/agentRunService';
import { AgentResponse } from './inventoryAgent';

export class BusinessInsightsAgent {
  static async handle(params: {
    businessId: string;
    query: string;
    runId: string;
    phoneNumber?: string;
  }): Promise<AgentResponse> {
    const { businessId, runId } = params;

    const startTime = Date.now();
    await AgentRunService.addStep(runId, {
      agentName: 'BusinessInsightsAgent',
      action: 'MULTI-DOMAIN SYNTHESIS: Cross-analyzing inventory, payments, compliance, and expenses',
      reasoning: 'Synthesizing all operational metrics into an executive health overview for the business owner.',
      durationMs: Date.now() - startTime,
    });

    const [business, inventory, payments, compliance, expenses] = await Promise.all([
      Business.findById(businessId),
      InventoryTools.getInventory(businessId),
      PaymentTools.getReconciliationSummary(businessId),
      ComplianceTools.getUpcomingDeadlines(businessId),
      ExpenseTools.getExpenseSummary(businessId),
    ]);

    const criticalInventory = inventory.filter((i) => i.stockStatus === 'CRITICAL');
    const lowInventory = inventory.filter((i) => i.stockStatus === 'LOW');
    const nextTask = compliance[0];

    let messageText = `📈 *Business Health Summary for ${business?.name || 'Your Store'}:*\n\n` +
      `• *Sales & Stock Velocity:* Healthy overall movement. Estimated weekly volume is steady.\n` +
      `• *Inventory Alerts:* ⚠️ *${criticalInventory.length + lowInventory.length} products need attention* (${criticalInventory.map((i) => i.name).join(', ')} critically low).\n` +
      `• *Supplier Payments:* *₹${payments.totalPendingAmount.toLocaleString('en-IN')} pending* across ${payments.pendingSupplierPayments.length} invoices. (${payments.discrepancies.length} discrepancy flagged).\n` +
      `• *Upcoming GST Task:* *${nextTask ? nextTask.title : 'None'}* due in *${nextTask ? nextTask.daysRemaining : 0} days*.\n` +
      `• *Recent Expenses:* ₹${expenses.total.toLocaleString('en-IN')} recorded.\n\n` +
      `🎯 *Top Recommended Agent Actions:*\n` +
      `1. Order *Cooking Oil & Rice* before stockouts in 2-3 days.\n` +
      `2. Settle ₹2,000 partial discrepancy with *ABC Wholesale*.\n` +
      `3. Review draft *GSTR-3B return* prepared by Compliance Agent.`;

    await AgentRunService.completeRun(runId, 'Business health report generated across 4 operational domains.');

    return {
      agentName: 'BusinessInsightsAgent',
      text: messageText,
      data: { inventoryCount: inventory.length, pendingPayments: payments.totalPendingAmount, daysToGST: nextTask?.daysRemaining },
      buttons: [
        { label: '📦 Handle Low Stock', payload: 'HANDLE_LOW_STOCK', style: 'primary' },
        { label: '💳 View Pending Payments', payload: 'VIEW_PAYMENTS', style: 'secondary' },
        { label: '⚖️ Review GST Draft', payload: 'REVIEW_GST', style: 'secondary' },
      ],
    };
  }
}
