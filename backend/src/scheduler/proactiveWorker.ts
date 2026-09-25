import { InventoryTools } from '../tools/inventoryTools';
import { ComplianceTools } from '../tools/complianceTools';
import { PaymentTools } from '../tools/paymentTools';
import { Business, Notification } from '../models';
import { AuditService } from '../services/auditService';

export class ProactiveWorker {
  private static timer: NodeJS.Timeout | null = null;

  static async runChecks(): Promise<void> {
    try {
      console.log('⏰ [ProactiveWorker] Running automated business health and risk assessment checks...');
      const businesses = await Business.find({});

      for (const b of businesses) {
        const businessId = b._id.toString();

        // 1. Check Inventory Stockout Risk
        const inventory = await InventoryTools.getInventory(businessId);
        const criticalItems = inventory.filter((i) => i.stockStatus === 'CRITICAL');
        for (const item of criticalItems) {
          const existingNotif = await Notification.findOne({
            businessId: b._id,
            type: 'INVENTORY_ALERT',
            title: { $regex: item.name, $options: 'i' },
            read: false,
          });

          if (!existingNotif) {
            await Notification.create({
              businessId: b._id,
              type: 'INVENTORY_ALERT',
              severity: 'CRITICAL',
              title: `Critical Stockout Alert: ${item.name}`,
              message: `${item.name} has only ${item.estimatedDaysLeft} days remaining (${item.currentStock} ${item.unit} left). Reorder recommended before stockout.`,
              read: false,
              linkTab: 'inventory',
            });
          }
        }

        // 2. Check Upcoming GST Deadlines
        const compliance = await ComplianceTools.getUpcomingDeadlines(businessId);
        const urgentTask = compliance.find((c) => c.daysRemaining <= 5 && c.status !== 'SUBMITTED');
        if (urgentTask) {
          const existingNotif = await Notification.findOne({
            businessId: b._id,
            type: 'COMPLIANCE_ALERT',
            read: false,
          });

          if (!existingNotif) {
            await Notification.create({
              businessId: b._id,
              type: 'COMPLIANCE_ALERT',
              severity: 'WARNING',
              title: `Upcoming Filing Deadline: ${urgentTask.title}`,
              message: `${urgentTask.title} is due in ${urgentTask.daysRemaining} days. Agent prepared draft reconciliation for owner verification.`,
              read: false,
              linkTab: 'compliance',
            });
          }
        }

        // 3. Check Payment Mismatches and Overdue Invoices
        const paymentReport = await PaymentTools.getReconciliationSummary(businessId);
        if (paymentReport.discrepancies.length > 0) {
          const disc = paymentReport.discrepancies[0];
          const existingNotif = await Notification.findOne({
            businessId: b._id,
            type: 'PAYMENT_ALERT',
            read: false,
          });

          if (!existingNotif) {
            await Notification.create({
              businessId: b._id,
              type: 'PAYMENT_ALERT',
              severity: 'WARNING',
              title: `Payment Discrepancy: ${disc.supplierName}`,
              message: `Discrepancy of ₹${disc.mismatchAmount.toLocaleString('en-IN')} on invoice #${disc.invoiceNumber}. ${disc.note}`,
              read: false,
              linkTab: 'payments',
            });
          }
        }
      }
      console.log('✅ [ProactiveWorker] Proactive checks finished.');
    } catch (err) {
      console.error('❌ [ProactiveWorker] Error executing background checks:', err);
    }
  }

  static start(intervalMs: number = 60000): void {
    if (this.timer) return;
    console.log(`Starting ProactiveWorker scheduler (Interval: ${intervalMs / 1000}s)`);
    // Run an initial check after 5 seconds
    setTimeout(() => this.runChecks(), 5000);
    this.timer = setInterval(() => this.runChecks(), intervalMs);
  }

  static stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
