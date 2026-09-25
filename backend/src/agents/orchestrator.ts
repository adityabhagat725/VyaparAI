import { InventoryAgent, AgentResponse } from './inventoryAgent';
import { PaymentAgent } from './paymentAgent';
import { ComplianceAgent } from './complianceAgent';
import { GovernmentSchemeAgent } from './schemeAgent';
import { ExpenseAgent } from './expenseAgent';
import { BusinessInsightsAgent } from './insightsAgent';
import { StaffAgent } from './staffAgent';
import { AgentRunService } from '../services/agentRunService';
import { Approval, PurchaseOrder, Conversation, Message } from '../models';
import { InventoryTools } from '../tools/inventoryTools';
import { AuditService } from '../services/auditService';

export class OrchestratorAgent {
  static classifyIntent(query: string): string {
    const q = query.toLowerCase().trim();

    // Check button action payloads first
    if (q.startsWith('approve:') || q === 'approve') return 'APPROVE_ACTION';
    if (q.startsWith('reject:') || q === 'reject') return 'REJECT_ACTION';
    if (q === 'handle_low_stock') return 'REORDER_INVENTORY';
    if (q.startsWith('order:')) return 'REORDER_INVENTORY';

    // 1. Order / Reorder / Procurement
    if (
      q.includes('order') ||
      q.includes('buy') ||
      q.includes('procure') ||
      q.includes('handle low stock') ||
      q.includes('handle the low stock') ||
      q.includes('reorder') ||
      q.includes('mangao') ||
      q.includes('khareedo') ||
      q.includes('bhejo') ||
      q.includes('मागवा') ||
      q.includes('मंगाओ') ||
      q.includes('ऑर्डर')
    ) {
      return 'REORDER_INVENTORY';
    }

    // 2. GST & Compliance
    if (
      q.includes('gst') ||
      q.includes('compliance') ||
      q.includes('tax') ||
      q.includes('return') ||
      q.includes('gstr') ||
      q.includes('deadline') ||
      q.includes('filing') ||
      q.includes('tax date') ||
      q.includes('जीएसटी') ||
      q.includes('पूर्तता') ||
      q.includes('कर')
    ) {
      return 'GST_COMPLIANCE';
    }

    // 3. Government Schemes
    if (
      q.includes('scheme') ||
      q.includes('subsidy') ||
      q.includes('mudra') ||
      q.includes('cgtmse') ||
      q.includes('pmegp') ||
      q.includes('support') ||
      q.includes('qualify') ||
      q.includes('government') ||
      q.includes('govt') ||
      q.includes('yojana') ||
      q.includes('sarkari') ||
      q.includes('योजना') ||
      q.includes('शासकीय') ||
      q.includes('अनुदान')
    ) {
      return 'GOVERNMENT_SCHEMES';
    }

    // 4. Supplier Payments & Reconciliation
    if (
      q.includes('payment') ||
      q.includes('supplier') ||
      q.includes('vendor') ||
      q.includes('invoice') ||
      q.includes('reconcil') ||
      q.includes('due') ||
      q.includes('unpaid') ||
      q.includes('pending') ||
      q.includes('whom do i owe') ||
      q.includes('haven\'t i paid') ||
      q.includes('havent i paid') ||
      q.includes('udhari') ||
      q.includes('kisko dena hai') ||
      q.includes('baki') ||
      q.includes('देयके') ||
      q.includes('थकबाकी') ||
      q.includes('भुगतान') ||
      q.includes('हिशोब')
    ) {
      return 'PAYMENT_RECONCILIATION';
    }

    // 5. Inventory check
    if (
      q.includes('inventory') ||
      q.includes('stock') ||
      q.includes('rice') ||
      q.includes('chawal') ||
      q.includes('oil') ||
      q.includes('tel') ||
      q.includes('sugar') ||
      q.includes('shakkar') ||
      q.includes('wheat') ||
      q.includes('gehu') ||
      q.includes('atta') ||
      q.includes('tea') ||
      q.includes('chai') ||
      q.includes('biscuit') ||
      q.includes('milk') ||
      q.includes('doodh') ||
      q.includes('salt') ||
      q.includes('namak') ||
      q.includes('kitna bacha') ||
      q.includes('maal kitna') ||
      q.includes('चावल') ||
      q.includes('तांदूळ') ||
      q.includes('साठा') ||
      q.includes('शिल्लक') ||
      (q.includes('how much') && !q.includes('expense') && !q.includes('spent'))
    ) {
      return 'CHECK_INVENTORY';
    }

    // 6. Expenses
    if (
      q.includes('petrol') ||
      q.includes('diesel') ||
      q.includes('fuel') ||
      q.includes('expense') ||
      q.includes('spent') ||
      q.includes('paid ') ||
      q.includes('bill ') ||
      q.includes('transport') ||
      q.includes('tempo') ||
      q.includes('kharch') ||
      q.includes('kharcha') ||
      q.includes('खर्च') ||
      q.includes('पेट्रोल')
    ) {
      return 'RECORD_EXPENSE';
    }

    // 7. Staff, Attendance & Salary Advances
    if (
      q.includes('staff') ||
      q.includes('employee') ||
      q.includes('salary') ||
      q.includes('payroll') ||
      q.includes('advance') ||
      q.includes('helper') ||
      q.includes('raju') ||
      q.includes('कर्मचारी') ||
      q.includes('वेतन') ||
      q.includes('पगार') ||
      q.includes('कामगार')
    ) {
      return 'STAFF_PAYROLL';
    }

    // 8. General Business Performance
    if (
      q.includes('business') ||
      q.includes('doing') ||
      q.includes('how is') ||
      q.includes('summary') ||
      q.includes('health') ||
      q.includes('overview') ||
      q.includes('status') ||
      q.includes('kaisa chal raha') ||
      q.includes('hisab') ||
      q.includes('dukan') ||
      q.includes('व्यापार') ||
      q.includes('व्यवसाय') ||
      q.includes('आढावा')
    ) {
      return 'BUSINESS_INSIGHTS';
    }

    return 'BUSINESS_INSIGHTS';
  }

  static async handleApprovalAction(params: {
    businessId: string;
    action: 'APPROVE' | 'REJECT';
    approvalId?: string;
    userId?: string;
  }): Promise<AgentResponse> {
    const { businessId, action, approvalId, userId } = params;

    let targetApproval = null;
    if (approvalId) {
      targetApproval = await Approval.findById(approvalId);
    } else {
      // Find latest pending approval for this business
      targetApproval = await Approval.findOne({ businessId, status: 'PENDING' }).sort({ createdAt: -1 });
    }

    if (!targetApproval) {
      return {
        agentName: 'Orchestrator',
        text: '⚠️ There are no pending approvals awaiting your confirmation right now.',
      };
    }

    if (action === 'REJECT') {
      targetApproval.status = 'REJECTED';
      targetApproval.userDecisionBy = userId as any;
      targetApproval.respondedAt = new Date();
      await targetApproval.save();

      if (targetApproval.actionType === 'CREATE_PURCHASE_ORDER' && targetApproval.dataPayload?.purchaseOrderId) {
        await PurchaseOrder.findByIdAndUpdate(targetApproval.dataPayload.purchaseOrderId, { status: 'REJECTED' });
      }

      await AuditService.log({
        businessId,
        userId,
        agentName: 'Orchestrator',
        actionType: 'REJECT_ACTION',
        resourceType: 'Approval',
        resourceId: targetApproval._id.toString(),
        riskLevel: targetApproval.riskLevel,
        status: 'SUCCESS',
      });

      return {
        agentName: 'Orchestrator',
        text: `❌ Action rejected: "${targetApproval.title}". The proposed operation was cancelled.`,
      };
    }

    // APPROVE
    targetApproval.status = 'APPROVED';
    targetApproval.userDecisionBy = userId as any;
    targetApproval.respondedAt = new Date();
    await targetApproval.save();

    let executionDetails = '';

    if (targetApproval.actionType === 'CREATE_PURCHASE_ORDER' && targetApproval.dataPayload?.purchaseOrderId) {
      const execResult = await InventoryTools.executePurchaseOrder(targetApproval.dataPayload.purchaseOrderId);
      targetApproval.executedAt = new Date();
      targetApproval.executionResult = execResult;
      await targetApproval.save();

      const po = execResult.po;
      const supp = targetApproval.dataPayload.supplierName || 'supplier';
      executionDetails = `\n\n✅ *Order Confirmed:* Order #${po.orderNumber} placed with ${supp}.\n• Total: ₹${po.totalAmount.toLocaleString('en-IN')}\n• Status: Simulated Dispatch (Delivery expected in 2 days)\n• Inventory auto-adjusted.`;
    }

    await AuditService.log({
      businessId,
      userId,
      agentName: 'Orchestrator',
      actionType: 'APPROVE_ACTION',
      resourceType: 'Approval',
      resourceId: targetApproval._id.toString(),
      riskLevel: targetApproval.riskLevel,
      status: 'SUCCESS',
      outputData: { approved: true, executionDetails },
    });

    return {
      agentName: 'Orchestrator',
      text: `✅ *Approval Confirmed:* Approved action "${targetApproval.title}".${executionDetails}\n\nAudit log updated with verified authorization.`,
    };
  }

  static async processMessage(params: {
    businessId: string;
    query: string;
    channel?: 'WHATSAPP' | 'WEB_ASSISTANT';
    phoneNumber?: string;
    userId?: string;
  }): Promise<AgentResponse> {
    const { businessId, query, channel = 'WHATSAPP', phoneNumber, userId } = params;

    // Handle interactive button clicks
    const trimmed = query.trim();
    if (trimmed.startsWith('APPROVE:') || trimmed.toLowerCase() === 'approve') {
      const parts = trimmed.split(':');
      const approvalId = parts.length > 1 ? parts[1] : undefined;
      return this.handleApprovalAction({ businessId, action: 'APPROVE', approvalId, userId });
    }
    if (trimmed.startsWith('REJECT:') || trimmed.toLowerCase() === 'reject') {
      const parts = trimmed.split(':');
      const approvalId = parts.length > 1 ? parts[1] : undefined;
      return this.handleApprovalAction({ businessId, action: 'REJECT', approvalId, userId });
    }

    const intent = this.classifyIntent(query);

    // Initialize Agent Run for observability
    const run = await AgentRunService.startRun({
      businessId,
      orchestratorIntent: intent,
      triggerSource: channel === 'WHATSAPP' ? 'WHATSAPP' : 'USER_CHAT',
      userQuery: query,
    });

    // Step 1: Orchestrator Classification
    const s1Start = Date.now();
    await AgentRunService.addStep(run._id.toString(), {
      agentName: 'Orchestrator',
      action: `INTENT_CLASSIFICATION -> ${intent}`,
      reasoning: `Received query "${query}". Routed to specialized domain agent based on intent keywords.`,
      durationMs: Date.now() - s1Start,
    });

    let response: AgentResponse;

    switch (intent) {
      case 'CHECK_INVENTORY':
      case 'REORDER_INVENTORY':
        response = await InventoryAgent.handle({ businessId, query, runId: run._id.toString(), phoneNumber });
        break;

      case 'PAYMENT_RECONCILIATION':
        response = await PaymentAgent.handle({ businessId, query, runId: run._id.toString(), phoneNumber });
        break;

      case 'GST_COMPLIANCE':
        response = await ComplianceAgent.handle({ businessId, query, runId: run._id.toString(), phoneNumber });
        break;

      case 'GOVERNMENT_SCHEMES':
        response = await GovernmentSchemeAgent.handle({ businessId, query, runId: run._id.toString(), phoneNumber });
        break;

      case 'RECORD_EXPENSE':
        response = await ExpenseAgent.handle({ businessId, query, runId: run._id.toString(), phoneNumber });
        break;

      case 'STAFF_PAYROLL':
        response = await StaffAgent.process(query, businessId);
        break;

      case 'BUSINESS_INSIGHTS':
      default:
        response = await BusinessInsightsAgent.handle({ businessId, query, runId: run._id.toString(), phoneNumber });
        break;
    }

    return response;
  }
}
