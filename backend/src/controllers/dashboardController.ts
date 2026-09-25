import { Request, Response } from 'express';
import { InventoryTools } from '../tools/inventoryTools';
import { PaymentTools } from '../tools/paymentTools';
import { ComplianceTools } from '../tools/complianceTools';
import { ExpenseTools } from '../tools/expenseTools';
import { Approval, AgentRun, Notification, Business } from '../models';

export class DashboardController {
  static async getOverview(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.businessId || req.user?.businessId;
      if (!businessId) {
        res.status(400).json({ error: 'Business ID required' });
        return;
      }

      const [business, inventory, payments, compliance, expenses, pendingApprovals, recentRuns, notifications] =
        await Promise.all([
          Business.findById(businessId),
          InventoryTools.getInventory(businessId),
          PaymentTools.getReconciliationSummary(businessId),
          ComplianceTools.getUpcomingDeadlines(businessId),
          ExpenseTools.getExpenseSummary(businessId),
          Approval.find({ businessId, status: 'PENDING' }).sort({ createdAt: -1 }),
          AgentRun.find({ businessId }).sort({ createdAt: -1 }).limit(8),
          Notification.find({ businessId, read: false }).sort({ createdAt: -1 }).limit(5),
        ]);

      // Calculate totals
      const lowStockItems = inventory.filter((i) => i.stockStatus === 'LOW' || i.stockStatus === 'CRITICAL');
      const totalInventoryValue = inventory.reduce((acc, i) => acc + i.currentStock * i.basePurchasePrice, 0);

      res.json({
        business,
        urgent: {
          lowStockCount: lowStockItems.length,
          criticalStockItems: lowStockItems.filter((i) => i.stockStatus === 'CRITICAL'),
          overduePaymentsCount: payments.overdueCount,
          totalPendingPayments: payments.totalPendingAmount,
          nextComplianceDeadline: compliance[0] || null,
        },
        aiActions: {
          pendingApprovalsCount: pendingApprovals.length,
          pendingApprovals,
          discrepanciesCount: payments.discrepancies.length,
        },
        businessSnapshot: {
          totalInventoryValue,
          totalProductsCount: inventory.length,
          pendingPaymentsAmount: payments.totalPendingAmount,
          totalExpensesRecorded: expenses.total,
          estimatedMonthlyRunRate: (business?.annualTurnover || 3800000) / 12,
        },
        agentActivity: recentRuns,
        notifications,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
